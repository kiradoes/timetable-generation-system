import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ArrowLeft,
  BookOpen,
  Download,
  Printer
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ScheduleEntry {
  day?: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  course_code?: string;
  course_name?: string;
  course_title?: string;
  venue_name?: string;
  lecturer_name?: string;
}

interface TimetableRow {
  day: string;
  time: string;
  start_time?: string;
  end_time?: string;
  courseCode: string;
  courseTitle: string;
  venue: string;
  lecturer: string;
}

interface StudentTimetableViewProps {
  session: string;
  semester: string;
  course: string;
  level: string;
  group: string;
  onBack: () => void;
  sessionId?: number;
  classGroupId?: number;
}

function formatTimeSlot(start?: string, end?: string): string {
  if (!start || !end) return '';
  const to12 = (t: string) => {
    const [h, m] = String(t).slice(0, 5).split(':').map(Number);
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const ampm = (h ?? 0) < 12 ? 'AM' : 'PM';
    return `${h12}:${String(m ?? 0).padStart(2, '0')} ${ampm}`;
  };
  return `${to12(start)} - ${to12(end)}`;
}

// Time slots 7 AM–6 PM (columns on top). Break/special only from academic settings (special_events).
// Display format: 8:00-9:00am (AM/PM only once, at the end, lowercase).
const STANDARD_TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let h = 7; h <= 17; h++) {
    const end = h + 1;
    const h12Start = h === 12 ? 12 : h > 12 ? h - 12 : h;
    const h12End = end === 12 ? 12 : end > 12 ? end - 12 : end;
    const ampmEnd = end < 12 ? 'am' : 'pm';
    const startLabel = `${h12Start}:00`;
    const endLabel = `${h12End}:00`;
    slots.push(`${startLabel}-${endLabel}${ampmEnd}`);
  }
  return slots;
})();

// Full time labels for column headers (visible, like BUCC reference)
const TIME_SLOT_HEADERS: string[] = STANDARD_TIME_SLOTS.slice();

export function StudentTimetableView({
  session,
  semester,
  course,
  level,
  group,
  onBack,
  sessionId,
  classGroupId
}: StudentTimetableViewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(!!(sessionId && classGroupId));
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [specialEvents, setSpecialEvents] = useState<{ day_of_week: string; start_time: string; end_time: string; event_name?: string; event_type?: string; description?: string | null; level?: number | null }[]>([]);
  const [timetableNotPublished, setTimetableNotPublished] = useState(false);

  useEffect(() => {
    if (!sessionId || !classGroupId) {
      setScheduleEntries([]);
      setSpecialEvents([]);
      setTimetableNotPublished(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchTimetable = async () => {
      setLoading(true);
      setTimetableNotPublished(false);
      try {
        const [timetableRes, eventsRes] = await Promise.all([
          api.getPublicTimetable(classGroupId, sessionId) as any,
          sessionId ? api.getSpecialEvents({ session_id: sessionId }) as any : Promise.resolve({ success: true, data: [] })
        ]);
        if (cancelled) return;
        const list = timetableRes?.success && Array.isArray(timetableRes?.data) ? timetableRes.data : [];
        setScheduleEntries(list);
        setTimetableNotPublished(timetableRes?.published === false);
        const evList = eventsRes?.success && Array.isArray(eventsRes?.data) ? eventsRes.data : [];
        setSpecialEvents(evList);
      } catch (_) {
        if (!cancelled) {
          setScheduleEntries([]);
          setSpecialEvents([]);
          setTimetableNotPublished(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTimetable();
    return () => { cancelled = true; };
  }, [sessionId, classGroupId]);

  const timetableData: TimetableRow[] = useMemo(() => {
    return scheduleEntries.map((e) => ({
      day: e.day_of_week || e.day || '',
      time: formatTimeSlot(e.start_time, e.end_time),
      start_time: e.start_time,
      end_time: e.end_time,
      courseCode: e.course_code || e.course_name || '—',
      courseTitle: e.course_title || e.course_name || '—',
      venue: e.venue_name || '—',
      lecturer: e.lecturer_name || '—',
    })).filter((r) => r.day && r.time);
  }, [scheduleEntries]);

  // Which standard slot indices an entry spans (e.g. 07:00-09:00 -> [0, 1])
  const getSlotIndices = (startTime?: string, endTime?: string): number[] => {
    if (!startTime || !endTime) return [];
    const toMins = (t: string) => {
      const [h, m] = String(t).slice(0, 5).split(':').map(Number);
      return (h ?? 0) * 60 + (m ?? 0);
    };
    const start = toMins(startTime);
    const end = toMins(endTime);
    const indices: number[] = [];
    for (let i = 0; i < STANDARD_TIME_SLOTS.length; i++) {
      const slotStart = (7 + i) * 60;
      const slotEnd = (8 + i) * 60;
      if (start < slotEnd && end > slotStart) indices.push(i);
    }
    return indices;
  };

  type CellInfo =
    | { type: 'skip' }
    | { type: 'course'; entry: TimetableRow; span: number }
    | { type: 'special'; label: string }
    | { type: 'empty' };

  const is12To1Slot = (idx: number) => idx === 5;
  const is1To2Slot = (idx: number) => idx === 6; // 1-2 PM: always show BREAK (no dash)

  const getCellForSlot = (day: string, slotIndex: number): CellInfo => {
    if (is1To2Slot(slotIndex)) return { type: 'special', label: 'BREAK' };
    const slotTime = STANDARD_TIME_SLOTS[slotIndex];
    const specialLabel = getSpecialEventForSlot(day, slotTime);
    // 12-1 PM: never show break; always show as empty (academic settings: break is 1-2 only).
    if (is12To1Slot(slotIndex) && specialLabel) {
      const l = specialLabel.toLowerCase();
      if (l === 'break' || l === 'lunch' || l.includes('break') || l.includes('lunch')) return { type: 'empty' };
    }
    // Break/special only when academic settings (special_events) have an event for this slot.
    if (specialLabel) return { type: 'special', label: specialLabel };
    const entry = timetableData.find((e) => {
      if (e.day !== day) return false;
      const indices = getSlotIndices(e.start_time, e.end_time);
      return indices.includes(slotIndex);
    });
    if (!entry) return { type: 'empty' };
    const indices = getSlotIndices(entry.start_time, entry.end_time);
    const isFirstSlot = indices[0] === slotIndex;
    if (!isFirstSlot) return { type: 'skip' };
    return { type: 'course', entry, span: indices.length };
  };

  // Columns: time 7 AM–6 PM on top; 1–2 PM is BREAK
  const timeSlots = STANDARD_TIME_SLOTS;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const getCourseName = (courseCode: string) => course || courseCode;

  // Show only first name (first word) of lecturer, first letter capital
  const lecturerFirst = (name: string | undefined) => {
    const word = (name || '').trim().split(/\s+/)[0] || name || '—';
    return word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '—';
  };

  // Display: course code in CAPITALS; venue first letter capital (title case)
  const caps = (s: string | undefined) => (s || '—').toUpperCase();
  const venueCase = (s: string | undefined) =>
    (s || '—').toLowerCase().replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());

  const levelNum = level ? parseInt(level, 10) : null;
  const parseEventLevel = (desc: string | null | undefined) => {
    if (!desc) return null;
    const match = desc.match(/Level\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  };
  const getSpecialEventForSlot = (day: string, timeSlot: string) => {
    const m = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)\s*-\s*(\d+):(\d+)\s*(AM|PM)/i);
    if (!m || !specialEvents.length) return null;
    const toMinutes = (h: number, min: number, ampm: string) => {
      if (ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
      if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
      return h * 60 + min;
    };
    const slotStart = toMinutes(parseInt(m[1], 10), parseInt(m[2], 10), m[3]);
    const slotEnd = toMinutes(parseInt(m[4], 10), parseInt(m[5], 10), m[6]);
    for (const ev of specialEvents) {
      const dayMatch = ev.day_of_week === 'All' || ev.day_of_week === day;
      const evLevel = ev.level ?? parseEventLevel(ev.description);
      const levelMatch = evLevel == null || evLevel === levelNum;
      const [sh, sm] = String(ev.start_time).slice(0, 5).split(':').map(Number);
      const [eh, em] = String(ev.end_time).slice(0, 5).split(':').map(Number);
      const evStart = (sh || 0) * 60 + (sm || 0);
      const evEnd = (eh || 0) * 60 + (em || 0);
      const overlaps = slotStart < evEnd && slotEnd > evStart;
      if (dayMatch && levelMatch && overlaps) {
        const name = (ev.event_name && ev.event_name.trim()) || (ev.event_type === 'lunch' ? 'Break' : ev.event_type === 'chapel' ? 'CHAPEL SEMINAR' : ev.event_type || '');
        return ev.event_type === 'chapel' ? (ev.event_name && ev.event_name.trim() ? ev.event_name.trim() : name) : name;
      }
    }
    return null;
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF('landscape');
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 6;
      const tableWidth = pageW - margin * 2;

      doc.setFillColor(15, 32, 68);
      doc.rect(0, 0, pageW, 22, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SCHOOL OF COMPUTING TIMETABLE', pageW / 2, 10, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('School of Computing Timetable System', pageW / 2, 17, { align: 'center' });

      doc.setTextColor(15, 32, 68);
      doc.setFontSize(10);
      const detailsY = 26;
      doc.text(`${session}  |  ${semester}  |  ${getCourseName(course)}  |  Level ${level}  |  Class ${group}  |  ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageW / 2, detailsY, { align: 'center' });

      // Rows = days (Mon–Fri), columns = time 7–6; multi-hour lectures as single merged cell (no line in between)
      type PdfCell = string | { content: string; colSpan: number };
      const tableData = days.map((day) => {
        const row: (string | PdfCell)[] = [day];
        let slotIndex = 0;
        while (slotIndex < timeSlots.length) {
          const cell = getCellForSlot(day, slotIndex);
          const content = (() => {
            if (cell.type === 'course') return `${caps(cell.entry.courseCode)}\n${venueCase(cell.entry.venue)}\n${lecturerFirst(cell.entry.lecturer)}`;
            if (cell.type === 'special') return cell.label;
            if (cell.type === 'skip') {
              const entry = timetableData.find((e) => e.day === day && getSlotIndices(e.start_time, e.end_time).includes(slotIndex));
              return entry ? `${caps(entry.courseCode)}\n${venueCase(entry.venue)}\n${lecturerFirst(entry.lecturer)}` : '-';
            }
            return '-';
          })();
          if (cell.type === 'course' && cell.span > 1) {
            row.push({ content, colSpan: cell.span });
            slotIndex += cell.span;
          } else {
            row.push(content);
            slotIndex += 1;
          }
        }
        return row;
      });

      const dayColWidth = 26;
      const timeColWidth = (tableWidth - dayColWidth) / timeSlots.length;
      const tableFontSize = 8;
      const tableCellPadding = 3;
      const colStyles: Record<string, { cellWidth: number; fontStyle?: 'bold' | 'normal'; halign?: 'left' | 'center' | 'right'; fontSize?: number; cellPadding?: number | { top?: number; right?: number; bottom?: number; left?: number }; overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden' }> = {
        '0': { cellWidth: dayColWidth, fontStyle: 'bold', halign: 'left', fontSize: tableFontSize, overflow: 'hidden', cellPadding: { left: 2, right: 2, top: tableCellPadding, bottom: tableCellPadding } },
      };
      timeSlots.forEach((_, i) => {
        colStyles[String(i + 1)] = { cellWidth: timeColWidth, halign: 'center', fontSize: tableFontSize, fontStyle: 'bold' };
      });

      const tableStartY = detailsY + 6;
      const footerY = pageH - 8;
      const availableHeight = footerY - tableStartY - 4;
      const rowCount = 1 + tableData.length;
      const minCellHeight = Math.max(8, Math.floor(availableHeight / rowCount));

      autoTable(doc, {
        startY: tableStartY,
        margin: { left: margin, right: margin },
        head: [['Day', ...timeSlots]],
        body: tableData,
        theme: 'grid',
        tableWidth,
        pageBreak: 'avoid',
        tableLineWidth: 0.25,
        tableLineColor: [120, 120, 120],
        headStyles: { fillColor: [15, 32, 68], textColor: [255, 255, 255], fontSize: tableFontSize, fontStyle: 'bold', halign: 'center', cellPadding: tableCellPadding },
        bodyStyles: { fontSize: tableFontSize, fontStyle: 'bold', cellPadding: tableCellPadding, valign: 'middle', overflow: 'linebreak', minCellHeight },
        columnStyles: colStyles,
        styles: { lineColor: [120, 120, 120], lineWidth: 0.25 },
      });

      // Ensure only one page: remove any extra pages created by table overflow
      const totalPages = doc.getNumberOfPages();
      for (let p = totalPages; p > 1; p--) {
        doc.deletePage(p);
      }
      doc.setPage(1);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('School of Computing Timetable System', pageW / 2, footerY, { align: 'center' });

      const fileName = `Timetable_${getCourseName(course).replace(/\s+/g, '_')}_${level}_Class_${group}_${semester}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f2044] mx-auto mb-4" />
          <p className="text-slate-600">Loading your timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#0f2044] border-b border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wide">
              School of Computing Timetable
            </h1>
            <p className="text-sm sm:text-base text-white font-normal mt-1.5">
              School of Computing Timetable System
            </p>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Button
              onClick={onBack}
              className="border border-white/30 bg-white text-[#0f2044] hover:bg-slate-100 font-medium shadow-sm"
            >
              <ArrowLeft className="mr-2 size-4 text-[#0f2044]" />
              <span className="text-[#0f2044]">Back to Search</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6 shadow-lg border-t-4 border-t-[#ffb71b]">
          <CardHeader className="bg-gradient-to-r from-[#0f2044] to-[#1a3a6b]">
            <CardTitle className="text-white">Summary</CardTitle>
            <p className="text-slate-300 text-sm mt-1">View your schedule below; you can download it as PDF.</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Academic Session</p>
                <p className="text-sm font-semibold text-[#0f2044]">{session}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Semester</p>
                <p className="text-sm font-semibold text-[#0f2044]">{semester} Semester</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Course of Study</p>
                <p className="text-sm font-semibold text-[#0f2044]">{getCourseName(course)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Level</p>
                <p className="text-sm font-semibold text-[#0f2044]">{level}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Class</p>
                <p className="text-sm font-semibold text-[#0f2044]">Class {group}</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
              <Button
                onClick={exportToPDF}
                disabled={isExporting || timetableData.length === 0}
                className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
              >
                {isExporting ? (
                  <>
                    <div className="mr-2 size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 size-4" />
                    Download as PDF
                  </>
                )}
              </Button>
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5"
              >
                <Printer className="mr-2 size-4" />
                Print
              </Button>
            </div>
          </CardContent>
        </Card>

        {timetableNotPublished ? (
          <Card className="shadow-lg border-amber-200 bg-amber-50">
            <CardContent className="py-12 text-center">
              <BookOpen className="size-12 mx-auto text-amber-500 mb-4" />
              <h3 className="text-lg font-semibold text-amber-900">Timetable not yet published</h3>
              <p className="text-amber-800 mt-2">The timetable for this session has not been approved and published yet. Please check back later.</p>
              <p className="text-sm text-amber-700 mt-1">Only published timetables are visible to students.</p>
            </CardContent>
          </Card>
        ) : !sessionId || !classGroupId ? (
          <Card className="shadow-lg border-amber-200 bg-amber-50">
            <CardContent className="py-12 text-center">
              <BookOpen className="size-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-[#0f2044]">No timetable yet</h3>
              <p className="text-slate-600 mt-2">There is no timetable available for your selection. Try again later or check back once your department has published the timetable.</p>
            </CardContent>
          </Card>
        ) : timetableData.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <BookOpen className="size-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-[#0f2044]">No schedule found</h3>
              <p className="text-slate-600 mt-2">There is no timetable scheduled yet for {getCourseName(course)} {level} Class {group}.</p>
              <p className="text-sm text-slate-500 mt-1">Schedules are created by timetable officers. If you just published, try again. Otherwise confirm your session and class are correct.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="shadow-lg overflow-hidden">
              <CardHeader className="bg-[#0f2044] border-b-0 flex flex-col items-center justify-center text-center py-5">
                <CardTitle className="text-[#ffb71b] font-bold text-xl sm:text-2xl flex items-center gap-2">
                  <img src="/bucc-logo-raw.png" alt="School of Computing" className="size-6 object-contain" />
                  School of Computing Timetable
                </CardTitle>
                <p className="text-white font-semibold text-sm sm:text-base mt-1.5">School of Computing</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed border-collapse">
                    <colgroup>
                      <col style={{ width: '9rem' }} />
                      {TIME_SLOT_HEADERS.map((_, i) => (
                        <col key={i} style={{ width: `calc((100% - 9rem) / ${TIME_SLOT_HEADERS.length})` }} />
                      ))}
                    </colgroup>
                    <thead>
                      <tr className="bg-[#0f2044]">
                        <th className="border border-slate-300 px-5 py-3 text-left text-white font-semibold sticky left-0 z-10 bg-[#0f2044] text-sm">
                          Day
                        </th>
                        {TIME_SLOT_HEADERS.map((header, i) => (
                          <th key={i} className="border border-slate-300 px-2 py-2.5 text-center text-white font-semibold text-xs overflow-hidden text-ellipsis min-w-0" style={{ width: 'calc((100% - 9rem) / 11)' }}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {days.map((day, rowIndex) => (
                        <tr key={day} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className={`border border-slate-300 px-5 py-3 font-semibold text-[#0f2044] text-sm sticky left-0 z-10 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                            {day}
                          </td>
                          {STANDARD_TIME_SLOTS.map((_, slotIndex) => {
                            const cell = getCellForSlot(day, slotIndex);
                            if (cell.type === 'skip') return null;
                            const colSpan = cell.type === 'course' ? cell.span : 1;
                            const isBreakSlot = !is12To1Slot(slotIndex) && cell.type === 'special' && (cell.label.toLowerCase() === 'break' || cell.label.toLowerCase() === 'lunch');
                            const isChapel = cell.type === 'special' && cell.label.toLowerCase().includes('chapel');
                            const isMultiHour = cell.type === 'course' && colSpan > 1;
                            const bgClass = isBreakSlot || isChapel
                              ? 'bg-amber-50'
                              : cell.type === 'course'
                                ? 'bg-white'
                                : cell.type === 'special'
                                  ? 'bg-blue-50/80'
                                  : 'bg-slate-50/50';
                            return (
                              <td
                                key={slotIndex}
                                colSpan={colSpan}
                                className={`border border-slate-300 align-top min-w-0 overflow-hidden ${bgClass}`}
                                style={{
                                  minHeight: '4.5rem',
                                  ...(isMultiHour ? { minHeight: `${colSpan * 4.5}rem` } : {}),
                                }}
                              >
                                <div className={`flex flex-col min-h-[4rem] p-2 ${isChapel || isBreakSlot ? 'items-start justify-center text-left' : 'items-center justify-center text-center'}`}>
                                  {isBreakSlot ? (
                                    <span className="text-amber-800 font-medium text-sm">
                                      {cell.label}
                                    </span>
                                  ) : cell.type === 'course' ? (
                                    <div className="flex flex-col items-center gap-1 w-full text-[#0f2044]">
                                      <span className="font-bold text-sm">
                                        {caps(cell.entry.courseCode)}
                                      </span>
                                      <span className="text-xs text-slate-600 leading-tight">
                                        {venueCase(cell.entry.venue)}
                                      </span>
                                      <span className="text-xs text-slate-600">
                                        {lecturerFirst(cell.entry.lecturer)}
                                      </span>
                                    </div>
                                  ) : isChapel ? (
                                    <div className="flex flex-col items-start gap-0.5 w-full">
                                      <span className="font-bold text-sm uppercase tracking-wide text-[#0f2044]">
                                        CHAPEL
                                      </span>
                                      <span className="text-sm text-[#0f2044] font-normal leading-tight">
                                        {(cell.label.replace(/^chapel\s*/i, '').trim() || 'University Chapel').replace(/\b\w/g, (c) => c.toUpperCase())}
                                      </span>
                                    </div>
                                  ) : cell.type === 'special' ? (
                                    <span className="text-blue-800 font-medium text-sm">
                                      {cell.label}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-sm">-</span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
