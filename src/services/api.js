import { supabase } from '../lib/supabase';

class ApiService {
  constructor() {
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('user');
      } else if (event === 'SIGNED_IN' && session) {
        this.getCurrentUser();
      }
    });
  }

  // Helper to turn duplicate/unique violation into a user-friendly message
  _friendlyDuplicateError(error) {
    if (!error) return null;
    const code = error.code || error.errno;
    const msg = (error.message || '').toLowerCase();
    const isUnique = code === '23505' || code === 23505 || msg.includes('unique') || msg.includes('duplicate key');
    if (!isUnique) return null;
    if (msg.includes('departments') && (msg.includes('name') || msg.includes('duplicate'))) return 'A department with this name already exists.';
    if (msg.includes('venues') || msg.includes('venue_id') || msg.includes('venues_name')) return 'A venue with this name already exists.';
    if (msg.includes('idx_lecturers_name_department_session') || msg.includes('lecturers_name_department_session') || (msg.includes('lecturers') && msg.includes('name'))) return 'A lecturer with this full name already exists in this department and session.';
    if (msg.includes('officers_fullname_department') || (msg.includes('officers') && msg.includes('full_name'))) return 'An officer with this full name already exists in this department.';
    if (msg.includes('lecturer') && msg.includes('slot')) return 'This lecturer is already scheduled at this day and time. Choose another lecturer or time.';
    if (msg.includes('venue') && msg.includes('slot')) return 'This venue is already booked at this day and time. Choose another venue or time.';
    if (msg.includes('group') && msg.includes('slot')) return 'This class group is already scheduled at this day and time. Choose another time.';
    if (msg.includes('schedules')) return 'This schedule conflicts with an existing booking (same lecturer, venue, or class at this time). Please choose another time or resource.';
    if (msg.includes('email')) return 'An account with this email already exists.';
    if (msg.includes('idx_courses_code_session') || (msg.includes('courses') && (msg.includes('course_code') || msg.includes('duplicate')))) return 'A course with this course code already exists for this session.';
    if (msg.includes('non_computing') || msg.includes('non_computing_courses')) return 'A non-computing course with this course code already exists for this session.';
    if (msg.includes('special_events')) return 'A special event for this session, day and level already exists. You cannot set the same thing twice.';
    if (msg.includes('idx_class_groups_unique') || (msg.includes('class_groups') && msg.includes('unique'))) return 'A class group with this name and level already exists in this department for this session. Use a different group name or level.';
    if (msg.includes('idx_semesters_session_name') || (msg.includes('semesters') && msg.includes('session'))) return 'A semester with this name already exists for this session. Use a different name or edit the existing semester.';
    return 'Name already exists. Please use a different name.';
  }

  _friendlyFkError(error) {
    if (!error) return null;
    const msg = (error.message || '').toLowerCase();
    const code = error.code || error.errno;
    if (code === '23503' || code === 23503 || msg.includes('foreign key')) {
      if (msg.includes('lecturers') && msg.includes('schedules')) return 'Cannot delete or update this lecturer because they are assigned to one or more schedules. Remove or reassign those schedules first.';
    }
    return null;
  }

  // Helper to handle Supabase responses
  handleResponse(data, error) {
    if (error) {
      // Only log real Supabase/PostgREST errors, not our own { message } objects
      const isRealError = error.code != null || error.details != null || error.statusCode != null || (error.hint != null);
      if (isRealError) console.error('Supabase error:', error.message || error);
      const friendlyDup = this._friendlyDuplicateError(error);
      const friendlyFk = this._friendlyFkError(error);
      const friendly = friendlyDup || friendlyFk;
      return {
        success: false,
        error: friendly || error.message || error.code || 'An error occurred',
        details: error
      };
    }
    return { success: true, data };
  }

  // =====================================================
  // AUTHENTICATION ENDPOINTS
  // =====================================================

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Get officer details
    let { data: officer, error: officerErr } = await supabase
      .from('officers')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .maybeSingle();

    // If officer doesn't exist, create it automatically (for users created via dashboard)
    if (officerErr && officerErr.code === 'PGRST116') {
      const fullName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Officer';
      const role = data.user.user_metadata?.role || 'department-officer';

      const { data: newOfficer, error: createErr } = await supabase
        .from('officers')
        .insert({
          auth_user_id: data.user.id,
          full_name: fullName,
          email: data.user.email,
          role: role,
          status: 'active',
        })
        .select()
        .single();

      if (createErr) {
        console.warn('Failed to create officer record:', createErr);
      } else {
        officer = newOfficer;
      }
    } else if (officerErr) {
      console.warn('No officer record for user:', officerErr.message || officerErr);
    }

    if (officer) {
      localStorage.setItem('user', JSON.stringify(officer));
      await supabase
        .from('officers')
        .update({ last_login: new Date().toISOString() })
        .eq('officer_id', officer.officer_id);
    }

    return {
      success: true,
      data: {
        user: data.user,
        officer,
        session: data.session,
      },
    };
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    localStorage.removeItem('user');
    if (error) throw new Error(error.message);
    return { success: true };
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, data: null };
    }

    let { data: officer, error: officerErr } = await supabase
      .from('officers')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    // If officer doesn't exist, create it automatically
    if (officerErr && officerErr.code === 'PGRST116') {
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Officer';
      const role = user.user_metadata?.role || 'department-officer';

      const { data: newOfficer, error: createErr } = await supabase
        .from('officers')
        .insert({
          auth_user_id: user.id,
          full_name: fullName,
          email: user.email,
          role: role,
          status: 'active',
        })
        .select()
        .single();

      if (createErr) {
        console.warn('Failed to create officer record:', createErr);
      } else {
        officer = newOfficer;
      }
    } else if (officerErr) {
      console.warn('No officer record for current user:', officerErr.message || officerErr);
    }

    if (officer) {
      localStorage.setItem('user', JSON.stringify(officer));
    }

    return { success: true, data: { user, officer } };
  }

  async register(userData) {
    const { email, password, name, role, department_id } = userData;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, department_id },
      },
    });

    if (error) throw new Error(error.message);
    return { success: true, data };
  }

  // =====================================================
  // DASHBOARD ENDPOINTS
  // =====================================================

  async getSchoolOfficerDashboard() {
    const [departments, lecturers, courses, schedules] = await Promise.all([
      supabase.from('departments').select('*', { count: 'exact' }),
      supabase.from('lecturers').select('*', { count: 'exact' }),
      supabase.from('courses').select('*', { count: 'exact' }),
      supabase.from('schedules').select('*', { count: 'exact' }).eq('status', 'scheduled'),
    ]);

    return {
      success: true,
      data: {
        totalDepartments: departments.count,
        totalLecturers: lecturers.count,
        totalCourses: courses.count,
        totalSchedules: schedules.count,
      },
    };
  }

  /** Write an audit_log entry for schedule (and optionally other tables). Used so STTO dashboard recent activity shows schedule creations.
   * If insert fails (e.g. 403 RLS on audit_log), we do not log to console so the app is not spammed; schedule create/update still succeeds. */
  async _logAudit(tableName, recordId, action, newValues = null, oldValues = null) {
    try {
      const userRes = await this.getCurrentUser();
      const officerId = userRes?.data?.officer?.officer_id ?? userRes?.data?.officer?.id ?? null;
      const { error } = await supabase.from('audit_log').insert([{
        table_name: tableName,
        record_id: recordId,
        action: action.toUpperCase(),
        new_values: newValues || {},
        old_values: oldValues || null,
        changed_by: officerId,
      }]);
      if (error) {
        const errMsg = String(error.message || '');
        if (error.code === '42501' || errMsg.includes('row-level security') || errMsg.includes('policy') || errMsg.includes('violates row-level security')) return;
        console.warn('Audit log insert failed:', error.message);
      }
    } catch (_) {}
  }

  /** Human-readable action label from audit_log row */
  _auditActionLabel(tableName, action, newValues) {
    const table = (tableName || '').toLowerCase();
    const act = (action || '').toUpperCase();
    const labels = {
      courses: { INSERT: 'Added course', UPDATE: 'Updated course', DELETE: 'Deleted course' },
      lecturers: { INSERT: 'Added lecturer', UPDATE: 'Updated lecturer', DELETE: 'Deleted lecturer' },
      class_groups: { INSERT: 'Added class group', UPDATE: 'Updated class group', DELETE: 'Deleted class group' },
      schedules: { INSERT: 'Scheduled lecture', UPDATE: 'Updated schedule', DELETE: 'Removed schedule' },
      venues: { INSERT: 'Added venue', UPDATE: 'Updated venue', DELETE: 'Deleted venue' },
      special_events: { INSERT: 'Added special event', UPDATE: 'Updated special event', DELETE: 'Deleted special event' },
      officers: { INSERT: 'Registered officer', UPDATE: 'Updated officer', DELETE: 'Removed officer' },
      sessions: { INSERT: 'Added session', UPDATE: 'Updated session', DELETE: 'Deleted session' },
      semesters: { INSERT: 'Added semester', UPDATE: 'Updated semester', DELETE: 'Deleted semester' },
    };
    const byTable = labels[table] || {};
    const label = byTable[act] || (act === 'INSERT' ? `Added ${table}` : act === 'UPDATE' ? `Updated ${table}` : `Deleted ${table}`);
    const detail = newValues?.course_code || newValues?.title || newValues?.full_name || newValues?.name;
    return detail ? `${label}: ${detail}` : label;
  }

  /** Recent activity from audit_log (what officers did). Returns same shape as getRecentOfficerActivities for dashboard.
   * options.department: when set, only return activity from officers in that department (for DTTO). */
  async getRecentAuditActivity(limit = 15, options = {}) {
    let logs = [];
    if (options.department) {
      const deptTrim = (options.department || '').trim();
      const deptPattern = deptTrim ? `${deptTrim}%` : null;
      if (!deptPattern) { return this.handleResponse([], null); }
      const { data: deptOfficers } = await supabase
        .from('officers')
        .select('officer_id')
        .ilike('department', deptPattern);
      const officerIds = (deptOfficers || []).map((o) => o.officer_id).filter((id) => id != null);
      if (officerIds.length === 0) return this.handleResponse([], null);
      const { data: departmentLogs, error: logError } = await supabase
        .from('audit_log')
        .select('log_id, table_name, action, changed_at, changed_by, new_values')
        .in('changed_by', officerIds)
        .order('changed_at', { ascending: false })
        .limit(limit * 3);
      if (logError) return this.handleResponse(null, logError);
      logs = departmentLogs || [];
    } else {
      const { data: allLogs, error } = await supabase
        .from('audit_log')
        .select('log_id, table_name, action, changed_at, changed_by, new_values')
        .order('changed_at', { ascending: false })
        .limit(limit * 3);
      if (error) return this.handleResponse(null, error);
      logs = allLogs || [];
    }
    const withOfficer = (logs || []).filter((l) => l.changed_by);
    const officerIds = [...new Set(withOfficer.map((l) => l.changed_by))];
    if (officerIds.length === 0) return this.handleResponse([], null);
    // Include all officers (school + department) so STTO sees schedule creations from everyone, including their own
    const { data: officers } = await supabase
      .from('officers')
      .select('officer_id, full_name, department, role')
      .in('officer_id', officerIds);
    const officerMap = (officers || []).reduce((acc, o) => {
      acc[o.officer_id] = o;
      return acc;
    }, {});
    const slice = withOfficer.slice(0, limit);
    // Resolve course for schedule entries so we show "Scheduled lecture: COURSE_CODE - Title" instead of lecturer name
    const scheduleLogs = slice.filter((l) => (l.table_name || '').toLowerCase() === 'schedules');
    const courseIds = [...new Set(scheduleLogs.map((l) => l.new_values?.course_id).filter((id) => id != null))];
    let courseMap = {};
    if (courseIds.length > 0) {
      const { data: courses } = await supabase.from('courses').select('course_id, course_code, title').in('course_id', courseIds);
      courseMap = (courses || []).reduce((acc, c) => { acc[c.course_id] = c; return acc; }, {});
    }
    const at = (d) => (d ? new Date(d) : null);
    const relative = (date) => {
      if (!date) return 'Recently';
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      return date.toLocaleDateString();
    };
    const items = slice.map((l) => {
      const o = officerMap[l.changed_by] || {};
      let description;
      const table = (l.table_name || '').toLowerCase();
      if (table === 'schedules' && l.new_values?.course_id != null) {
        const course = courseMap[l.new_values.course_id];
        const parts = course ? [course.course_code, course.title || 'Course'].filter(Boolean) : [];
        const courseLabel = parts.length ? parts.join(' - ') : 'Course scheduled';
        const act = (l.action || '').toUpperCase();
        const prefix = act === 'INSERT' ? 'Scheduled lecture' : act === 'UPDATE' ? 'Updated schedule' : act === 'DELETE' ? 'Removed schedule' : 'Schedule';
        description = `${prefix}: ${courseLabel}`;
      } else {
        description = this._auditActionLabel(l.table_name, l.action, l.new_values);
      }
      return {
        officer_id: l.changed_by,
        full_name: o.full_name || 'Officer',
        department: o.department || '-',
        at: l.changed_at,
        description,
        timeAgo: relative(at(l.changed_at)),
      };
    });
    return this.handleResponse(items, null);
  }

  /** Recent activities from department officers. Prefers audit_log actions; then falls back to schedules in that department (so DTTO sees "Scheduled lecture: ..." even when schedules were seeded); then last login. */
  async getRecentOfficerActivities(limit = 15, options = {}) {
    const auditRes = await this.getRecentAuditActivity(limit, options);
    if (auditRes.success && Array.isArray(auditRes.data) && auditRes.data.length > 0) {
      const withDescription = auditRes.data.map((item) => ({
        ...item,
        description: item.timeAgo ? `${item.description} · ${item.timeAgo}` : item.description,
      }));
      return this.handleResponse(withDescription, null);
    }
    // When department is set and audit is empty (e.g. schedules were seeded), show recent schedules for that department as activity so DTTO sees "Scheduled lecture: ..."
    if (options.department && options.department.trim()) {
      const dept = options.department.trim();
      const deptPattern = `${dept}%`;
      const { data: deptCourses } = await supabase.from('courses').select('course_id, course_code, title').ilike('department', deptPattern);
      const courseIds = (deptCourses || []).map((c) => c.course_id).filter((id) => id != null);
      if (courseIds.length > 0) {
        const { data: schedRows } = await supabase
          .from('schedules')
          .select('schedule_id, course_id, created_at')
          .eq('status', 'scheduled')
          .in('course_id', courseIds)
          .order('created_at', { ascending: false })
          .limit(limit);
        if (schedRows && schedRows.length > 0) {
          const courseMap = (deptCourses || []).reduce((acc, c) => { acc[c.course_id] = c; return acc; }, {});
          const { data: deptOfficers } = await supabase.from('officers').select('officer_id, full_name').eq('role', 'department-officer').ilike('department', deptPattern).limit(1);
          const officerName = (deptOfficers && deptOfficers[0]?.full_name) ? deptOfficers[0].full_name : 'Department';
          const relative = (date) => {
            if (!date) return 'Recently';
            const now = new Date();
            const d = new Date(date);
            const diffMs = now - d;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins} min ago`;
            if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
            return d.toLocaleDateString();
          };
          const items = schedRows.map((row) => {
            const course = courseMap[row.course_id];
            const courseLabel = course ? [course.course_code, course.title || 'Course'].filter(Boolean).join(' - ') : 'Course scheduled';
            const timeAgo = relative(row.created_at);
            return {
              officer_id: deptOfficers && deptOfficers[0] ? deptOfficers[0].officer_id : null,
              full_name: officerName,
              department: dept,
              description: `Scheduled lecture: ${courseLabel} · ${timeAgo}`,
            };
          });
          return this.handleResponse(items, null);
        }
      }
    }
    let officersQuery = supabase
      .from('officers')
      .select('officer_id, full_name, department, last_login, updated_at, created_at')
      .eq('role', 'department-officer')
      .eq('status', 'active');
    if (options.department) officersQuery = officersQuery.ilike('department', options.department);
    const { data: officers, error } = await officersQuery
      .order('last_login', { ascending: false, nullsFirst: false })
      .limit(limit);
    if (error) return this.handleResponse(null, error);
    const withActivity = (officers || []).map((o) => {
      const at = o.last_login || o.updated_at || o.created_at;
      const date = at ? new Date(at) : null;
      let description = 'No recent activity';
      if (date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) description = 'Active just now';
        else if (diffMins < 60) description = `Active ${diffMins} min ago`;
        else if (diffHours < 24) description = `Active ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        else if (diffDays < 7) description = `Active ${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        else description = `Last active ${date.toLocaleDateString()}`;
      }
      return { officer_id: o.officer_id, full_name: o.full_name, department: o.department || '—', at: at || null, description };
    });
    return this.handleResponse(withActivity, null);
  }

  async getDepartmentOfficerDashboard() {
    const { data: officer } = await this.getCurrentUser();
    const departmentId = officer?.officer?.department_id;

    if (!departmentId) {
      throw new Error('Department officer must be assigned to a department');
    }

    const [lecturers, courses, schedules] = await Promise.all([
      supabase.from('lecturers').select('*', { count: 'exact' }).eq('department_id', departmentId),
      supabase.from('courses').select('*', { count: 'exact' }).eq('department_id', departmentId),
      supabase.from('schedules').select('*', { count: 'exact' }).eq('status', 'scheduled'),
    ]);

    return {
      success: true,
      data: {
        totalLecturers: lecturers.count,
        totalCourses: courses.count,
        totalSchedules: schedules.count,
      },
    };
  }

  // =====================================================
  // DEPARTMENTS
  // =====================================================

  async getDepartments(params = {}) {
    let q = supabase.from('departments').select('*');
    // By default return only active departments so dropdowns exclude deactivated ones
    const includeInactive = params.includeInactive === true || params.all === true;
    if (!includeInactive && params.status === undefined) {
      q = q.eq('status', 'active');
    }
    for (const [k, v] of Object.entries(params || {})) {
      if (k === 'limit' || k === 'page' || k === 'includeInactive' || k === 'all') continue;
      if (k === 'status' && includeInactive) continue;
      q = q.eq(k, v);
    }
    if (params.limit && params.page) {
      const limit = Number(params.limit);
      const page = Number(params.page);
      const from = (page - 1) * limit;
      q = q.range(from, from + limit - 1);
    }
    const { data, error } = await q;
    return this.handleResponse(data, error);
  }

  async getDepartmentById(id) {
    const { data, error } = await supabase.from('departments').select('*').eq('department_id', id).maybeSingle();
    return this.handleResponse(data, error);
  }

  async getActiveDepartments() {
    const { data, error } = await supabase.from('departments').select('*').eq('status', 'active');
    return this.handleResponse(data, error);
  }

  async createDepartment(data) {
    const { data: res, error } = await supabase.from('departments').insert([data]).select().single();
    return this.handleResponse(res, error);
  }

  async updateDepartment(id, data) {
    const { data: res, error } = await supabase.from('departments').update(data).eq('department_id', id).select().single();
    return this.handleResponse(res, error);
  }

  async deleteDepartment(id) {
    const { data, error } = await supabase.from('departments').delete().eq('department_id', id);
    return this.handleResponse(data, error);
  }

  async updateDepartmentStatus(id, status) {
    const { data, error } = await supabase.from('departments').update({ status }).eq('department_id', id).select().single();
    return this.handleResponse(data, error);
  }

  // =====================================================
  // OFFICERS
  // =====================================================

  async getOfficers(params = {}) {
    let q = supabase.from('officers').select('*');
    for (const [k, v] of Object.entries(params || {})) {
      if (k === 'limit' || k === 'page') continue;
      q = q.eq(k, v);
    }
    if (params.limit && params.page) {
      const limit = Number(params.limit);
      const page = Number(params.page);
      const from = (page - 1) * limit;
      q = q.range(from, from + limit - 1);
    }
    const { data, error } = await q;
    return this.handleResponse(data, error);
  }

  async getOfficerById(id) {
    const { data, error } = await supabase.from('officers').select('*').eq('officer_id', id).maybeSingle();
    return this.handleResponse(data, error);
  }

  async createOfficer(data) {
    console.log('=== CREATE OFFICER START ===');
    console.log('Input data:', JSON.stringify(data, null, 2));

    try {
      // 1. Force a token refresh — getSession() can return stale/expired cached tokens
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      let session = refreshData?.session;

      console.log('refreshSession result:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        tokenLength: session?.access_token?.length || 0,
        refreshError: refreshError?.message || 'none'
      });

      // Fallback to getSession if refresh didn't work
      if (!session?.access_token) {
        console.warn('refreshSession failed, trying getSession...');
        const { data: fallback } = await supabase.auth.getSession();
        session = fallback?.session;
        console.log('getSession fallback:', {
          hasSession: !!session,
          hasAccessToken: !!session?.access_token
        });
      }

      if (!session?.access_token) {
        console.error('NO VALID SESSION after refresh + fallback');
        return { success: false, error: 'Not authenticated - please log in again', data: null };
      }

      // Decode JWT to check expiry (for debugging)
      try {
        const payload = JSON.parse(atob(session.access_token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        console.log('JWT payload:', {
          sub: payload.sub,
          role: payload.role,
          exp: payload.exp,
          iat: payload.iat,
          expiresIn: `${payload.exp - now} seconds`,
          isExpired: payload.exp < now
        });
      } catch (e) {
        console.warn('Could not decode JWT payload:', e);
      }

      // 2. Build request
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const functionUrl = `${supabaseUrl}/functions/v1/create-officer`;

      const requestBody = {
        full_name: data.full_name,
        email: data.email,
        department: data.department,
        password: data.password
      };

      // Gateway auth: use anon key (HS256 JWT the gateway trusts)
      // User auth: pass user's access token via x-user-token header
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
        'x-user-token': `Bearer ${session.access_token}`
      };

      console.log('Request URL:', functionUrl);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      console.log('Gateway auth (anon key):', headers['Authorization'].substring(0, 50) + '...');
      console.log('User token (x-user-token):', headers['x-user-token'].substring(0, 50) + '...');

      // 3. Make raw fetch call
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status, response.statusText);

      const responseText = await response.text();
      console.log('Raw response body:', responseText);

      // 4. Parse response
      let res;
      try {
        res = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('Failed to parse response as JSON:', parseErr);
        return { success: false, error: `Server returned non-JSON: ${responseText.substring(0, 200)}`, data: null };
      }

      if (!response.ok) {
        console.error('Edge Function returned error status:', response.status, res);
        return { success: false, error: res.error || res.message || `Server error: ${response.status}`, data: null };
      }

      if (res?.error) {
        console.error('Response contains error field:', res.error);
        return { success: false, error: res.error, data: null };
      }

      console.log('=== OFFICER CREATED SUCCESSFULLY ===', res);
      return { success: true, data: res.data, error: null };
    } catch (err) {
      console.error('=== UNEXPECTED ERROR ===', err);
      return { success: false, error: err.message || 'An unexpected error occurred', data: null };
    }
  }

  async updateOfficer(id, data) {
    // If password is provided, we need to update auth.users separately
    // But we can't do that from client side - password changes should be handled by Edge Function
    // For now, just update officer record (no password field in officers table)
    const { password, ...officerData } = data;

    if (password) {
      // TODO: Create update-officer Edge Function if password changes are needed
      console.warn('Password updates not yet implemented - requires Edge Function');
    }

    const { data: res, error } = await supabase
      .from('officers')
      .update(officerData)
      .eq('officer_id', id)
      .select()
      .single();
    return this.handleResponse(res, error);
  }

  async deleteOfficer(id) {
    const { data, error } = await supabase.from('officers').delete().eq('officer_id', id);
    return this.handleResponse(data, error);
  }

  async updateOfficerStatus(id, status) {
    const { data, error } = await supabase.from('officers').update({ status }).eq('officer_id', id).select().single();
    return this.handleResponse(data, error);
  }

  // =====================================================
  // VENUES
  // =====================================================

  async getVenues(params = {}) {
    let q = supabase.from('venues').select('*');
    // Venues are school-wide: no department/session_id column; ignore so both school and department officers see all venues
    const venueColumns = ['venue_id', 'name', 'building', 'capacity', 'type', 'equipment', 'status'];
    for (const [k, v] of Object.entries(params || {})) {
      if (k === 'limit' || k === 'page') continue;
      if (k === 'department' || k === 'session_id') continue;
      if (venueColumns.includes(k) && v != null && v !== '') q = q.eq(k, v);
    }
    if (params.limit && params.page) {
      const limit = Number(params.limit);
      const page = Number(params.page);
      const from = (page - 1) * limit;
      q = q.range(from, from + limit - 1);
    }
    const { data, error } = await q;
    return this.handleResponse(data, error);
  }

  async getVenueById(id) {
    const { data, error } = await supabase.from('venues').select('*').eq('venue_id', id).maybeSingle();
    return this.handleResponse(data, error);
  }

  async getAvailableVenues(params = {}) {
    // available means status = 'available' and optional filters
    let q = supabase.from('venues').select('*').eq('status', 'available');
    for (const [k, v] of Object.entries(params || {})) {
      if (k === 'limit' || k === 'page') continue;
      q = q.eq(k, v);
    }
    const { data, error } = await q;
    return this.handleResponse(data, error);
  }

  async getVenueTypes() {
    // types are stored as enum; return distinct types from venues
    const { data, error } = await supabase.from('venues').select('type', { count: 'exact' }).limit(1000);
    return this.handleResponse(data, error);
  }

  async getVenuesByBuilding(building) {
    const { data, error } = await supabase.from('venues').select('*').eq('building', building);
    return this.handleResponse(data, error);
  }

  _normalizeVenueName(s) {
    return (s || '').trim().replace(/\s+/g, '').toLowerCase();
  }

  async createVenue(data) {
    const name = (data.name || data.venue_name || '').trim();
    if (name) {
      const { data: existing } = await supabase.from('venues').select('venue_id, name').limit(1000);
      const normalizedNew = this._normalizeVenueName(name);
      const match = (existing || []).find((v) => this._normalizeVenueName(v.name) === normalizedNew);
      if (match) return this.handleResponse(null, { message: 'A venue with this name already exists.' });
    }
    const toInsert = { ...data };
    if (toInsert.venue_name != null && toInsert.name == null) toInsert.name = toInsert.venue_name;
    delete toInsert.venue_name;
    const { data: res, error } = await supabase.from('venues').insert([toInsert]).select().single();
    return this.handleResponse(res, error);
  }

  async updateVenue(id, data) {
    const name = (data.name || data.venue_name || '').trim();
    if (name) {
      const { data: existing } = await supabase.from('venues').select('venue_id, name').limit(1000);
      const normalizedNew = this._normalizeVenueName(name);
      const match = (existing || []).find((v) => Number(v.venue_id) !== Number(id) && this._normalizeVenueName(v.name) === normalizedNew);
      if (match) return this.handleResponse(null, { message: 'A venue with this name already exists.' });
    }
    const toUpdate = { ...data };
    if (toUpdate.venue_name != null && toUpdate.name == null) toUpdate.name = toUpdate.venue_name;
    delete toUpdate.venue_name;
    const { data: res, error } = await supabase.from('venues').update(toUpdate).eq('venue_id', id).select().single();
    return this.handleResponse(res, error);
  }

  async deleteVenue(id) {
    const { count, error: checkErr } = await supabase
      .from('schedules')
      .select('schedule_id', { count: 'exact', head: true })
      .eq('venue_id', id);
    if (checkErr) return this.handleResponse(null, checkErr);
    if (count != null && count > 0) {
      return this.handleResponse(null, {
        message: `Cannot delete this venue because it is assigned to ${count} schedule(s). Reassign those sessions to another venue or remove the schedules first, then try again.`,
      });
    }
    const { data, error } = await supabase.from('venues').delete().eq('venue_id', id);
    return this.handleResponse(data, error);
  }

  // =====================================================
  // LECTURERS
  // =====================================================

  async getLecturers(params = {}) {
    let q = supabase.from('lecturers').select('*');
    for (const [k, v] of Object.entries(params || {})) {
      if (k === 'limit' || k === 'page') continue;
      q = q.eq(k, v);
    }
    if (params.limit && params.page) {
      const limit = Number(params.limit);
      const page = Number(params.page);
      const from = (page - 1) * limit;
      q = q.range(from, from + limit - 1);
    }
    const { data, error } = await q;
    return this.handleResponse(data, error);
  }

  async getLecturerById(id) {
    const { data, error } = await supabase.from('lecturers').select('*').eq('lecturer_id', id).maybeSingle();
    return this.handleResponse(data, error);
  }

  async getLecturerAvailability(id) {
    const { data, error } = await supabase.from('lecturer_availability').select('*').eq('lecturer_id', id);
    return this.handleResponse(data, error);
  }

  async createLecturer(data) {
    const { data: res, error } = await supabase.from('lecturers').insert([data]).select().single();
    return this.handleResponse(res, error);
  }

  async updateLecturer(id, data) {
    const { data: res, error } = await supabase.from('lecturers').update(data).eq('lecturer_id', id).select().single();
    return this.handleResponse(res, error);
  }

  async deleteLecturer(id) {
    const { error: schedErr } = await supabase.from('schedules').delete().eq('lecturer_id', id);
    if (schedErr) return this.handleResponse(null, schedErr);
    const { data, error } = await supabase.from('lecturers').delete().eq('lecturer_id', id);
    return this.handleResponse(data, error);
  }

  async updateLecturerAvailability(id, availability) {
    // replace all availability rows for lecturer
    const { data: del, error: delErr } = await supabase.from('lecturer_availability').delete().eq('lecturer_id', id);
    if (delErr) console.warn('Error clearing availability:', delErr.message || delErr);
    const toInsert = (availability || []).map((a) => ({ ...a, lecturer_id: id }));
    const { data: res, error } = await supabase.from('lecturer_availability').insert(toInsert).select();
    return this.handleResponse(res, error);
  }

  // Lecturer preferences (stored in lecturers.preferences JSON)
  async getLecturerPreference(lecturerId) {
    const { data, error } = await supabase.from('lecturers').select('preferences, max_classes_per_day').eq('lecturer_id', lecturerId).maybeSingle();
    if (error) return this.handleResponse(null, error);
    const prefs = data?.preferences ? (typeof data.preferences === 'string' ? JSON.parse(data.preferences) : data.preferences) : null;
    return this.handleResponse(prefs ? { preference_id: lecturerId, lecturer_id: lecturerId, ...prefs, max_classes_per_day: prefs.max_classes_per_day ?? data?.max_classes_per_day ?? 4 } : null, null);
  }

  async createLecturerPreference(prefData) {
    const { lecturer_id, max_classes_per_day, preferences } = prefData;
    const payload = { max_classes_per_day: max_classes_per_day ?? 4 };
    const prefsJson = JSON.stringify({
      preferences: preferences != null ? String(preferences) : '',
      preferred_times: prefData.preferred_times || [],
      unavailable_days: prefData.unavailable_days || [],
      unavailable_times: prefData.unavailable_times || [],
    });
    const { data, error } = await supabase.from('lecturers').update({ preferences: prefsJson, ...payload }).eq('lecturer_id', lecturer_id).select().single();
    return this.handleResponse(data, error);
  }

  async updateLecturerPreference(preference_id, prefData) {
    return this.createLecturerPreference({ ...prefData, lecturer_id: preference_id });
  }

  async deleteLecturerPreference(prefId) {
    const { data, error } = await supabase.from('lecturers').update({ preferences: null }).eq('lecturer_id', prefId).select().single();
    return this.handleResponse(data, error);
  }

  // =====================================================
  // COURSES
  // =====================================================

  async getCourses(params = {}) {
    let q = supabase.from('courses').select('*');
    for (const [k, v] of Object.entries(params || {})) {
      if (k === 'limit' || k === 'page' || k === 'computing_only') continue;
      q = q.eq(k, v);
    }
    // Only computing courses (exclude GEDS/SAT): department view, or when explicitly requested
    if (params.department != null || params.computing_only === true) {
      q = q.in('category', ['Computing', 'Core', 'Elective']);
    }
    if (params.limit && params.page) {
      const limit = Number(params.limit);
      const page = Number(params.page);
      const from = (page - 1) * limit;
      q = q.range(from, from + limit - 1);
    }
    const { data, error } = await q;
    return this.handleResponse(data, error);
  }

  async getCourseById(id) {
    const { data, error } = await supabase.from('courses').select('*').eq('course_id', id).maybeSingle();
    return this.handleResponse(data, error);
  }

  async getCoursesByDepartment(departmentId, params = {}) {
    let q = supabase.from('courses').select('*').eq('department', departmentId);
    for (const [k, v] of Object.entries(params || {})) {
      if (k === 'limit' || k === 'page') continue;
      q = q.eq(k, v);
    }
    const { data, error } = await q;
    return this.handleResponse(data, error);
  }

  async createCourse(data) {
    const { data: res, error } = await supabase.from('courses').insert([data]).select().single();
    return this.handleResponse(res, error);
  }

  async updateCourse(id, data) {
    const { data: res, error } = await supabase.from('courses').update(data).eq('course_id', id).select().single();
    return this.handleResponse(res, error);
  }

  async deleteCourse(id) {
    const { data, error } = await supabase.from('courses').delete().eq('course_id', id);
    return this.handleResponse(data, error);
  }

  // =====================================================
  // SESSIONS & SEMESTERS
  // =====================================================

  async getSessions(params = {}) {
    let q = supabase.from('sessions').select('*');
    for (const [k, v] of Object.entries(params || {})) {
      if (k === 'limit' || k === 'page') continue;
      q = q.eq(k, v);
    }
    const { data, error } = await q;
    return this.handleResponse(data, error);
  }

  async getSessionById(id) {
    const { data, error } = await supabase.from('sessions').select('*').eq('session_id', id).maybeSingle();
    return this.handleResponse(data, error);
  }

  async getCurrentSession() {
    const { data, error } = await supabase.from('sessions').select('*').eq('is_current', true).maybeSingle();
    return this.handleResponse(data, error);
  }

  async createSession(data) {
    const { data: res, error } = await supabase.from('sessions').insert([data]).select().single();
    return this.handleResponse(res, error);
  }

  async updateSession(id, data) {
    const { data: res, error } = await supabase.from('sessions').update(data).eq('session_id', id).select().maybeSingle();
    if (error) return this.handleResponse(null, error);
    return this.handleResponse(res, null);
  }

  async deleteSession(id) {
    const { data, error } = await supabase.from('sessions').delete().eq('session_id', id);
    return this.handleResponse(data, error);
  }

  async setCurrentSession(id) {
    const { error: unsetErr } = await supabase.from('sessions').update({ is_current: false }).neq('session_id', id);
    if (unsetErr) return this.handleResponse(null, unsetErr);
    const { data, error } = await supabase.from('sessions').update({ is_current: true }).eq('session_id', id).select().maybeSingle();
    if (error) return this.handleResponse(null, error);
    return this.handleResponse(data, null);
  }

  async clearCurrentSession() {
    const { error } = await supabase.from('sessions').update({ is_current: false }).neq('session_id', 0);
    return this.handleResponse({ cleared: true }, error);
  }

  async addSemestersToSession(sessionId, semesters) {
    const toInsert = (semesters || []).map((s) => ({ ...s, session_id: sessionId }));
    const { data, error } = await supabase.from('semesters').upsert(toInsert, { onConflict: 'session_id,name', ignoreDuplicates: false }).select();
    return this.handleResponse(data, error);
  }

  async getSemesters(params = {}) {
    let q = supabase.from('semesters').select('*');
    for (const [k, v] of Object.entries(params || {})) {
      if (k === 'limit' || k === 'page') continue;
      q = q.eq(k, v);
    }
    const { data, error } = await q;
    return this.handleResponse(data, error);
  }

  async getSemestersBySession(sessionId) {
    return this.getSemesters({ session_id: sessionId });
  }

  async createSemester(data) {
    const sessionId = data.session_id;
    if (sessionId != null && data.status === 'active') {
      const { data: existing } = await supabase.from('semesters').select('semester_id, status').eq('session_id', sessionId);
      const hasActive = Array.isArray(existing) && existing.some((s) => s.status === 'active');
      if (hasActive) return this.handleResponse(null, { message: 'Only one semester can be active at a time. Deactivate the current semester before adding another.' });
    }
    const { data: res, error } = await supabase.from('semesters').upsert([data], { onConflict: 'session_id,name' }).select().single();
    if (error) return this.handleResponse(null, error);
    if (res && data.status === 'active' && sessionId != null) {
      await supabase.from('semesters').update({ status: 'inactive' }).eq('session_id', sessionId).neq('semester_id', res.semester_id);
    }
    return this.handleResponse(res, null);
  }

  /**
   * TIMETABLE RULES (enforced during scheduling and publish)
   * 1. Publish: Cannot publish until all required courses are scheduled for every class (per group); see canPublishSemester.
   * 2. Venue: A venue must not be assigned to more than one class at the same time; checkVenueConflict.
   * 3. Lecturer: A lecturer must not be scheduled for more than one class at the same time; checkLecturerTimeConflict.
   * 4. Class: A class must not be scheduled for overlapping lectures; checkClassGroupTimeConflict.
   * 5. Venue capacity: Venue capacity must be at least the class size; enforced in createSchedule/updateSchedule.
   * 6. Same course+class must use the same lecturer across all slots; _getRequiredLecturerForCourseGroup.
   * 7. Predefined constraints (e.g. max 2 slots per course per group per week); checkCourseHoursForGroup.
   */

  // ========== SEMESTER HOURS (static logic) ==========
  // How many hours per (course, class group) for each semester type. Used by checkCourseHoursForGroup and canPublishSemester.
  // - First / Second: required hours = course.credit_units (default FIRST_SECOND_DEFAULT_HOURS). Course clears from dropdown when scheduled hours ≥ that. Publish = every (course, class) has ≥ credit_units hours.
  // - Summer: 2 HOURS total per (course, group). Publish = every required (course, class) has ≥ 2 hours.
  // - Post-SIWES: 6 HOURS total per (course, group). Publish = every required (course, class) has ≥ 6 hours.
  // Semester is identified by name: "summer" (or includes "summer"), "post-siwes" (or "post siwes"); everything else = First/Second.
  static SEMESTER_HOURS = { SUMMER_HOURS: 2, POST_SIWES_HOURS: 6, FIRST_SECOND_DEFAULT_HOURS: 2 };

  /**
   * Check if the timetable for this semester can be published.
   * - First/Second: every class group must have all required courses scheduled at least once.
   * - Summer: every required (group, course) must have at least 2 hours scheduled total.
   * - Post-SIWES: every required (group, course) must have at least 6 hours scheduled total.
   * When options.publish_group_id is set, only that group is validated (so you can publish one complete group at a time).
   * Returns { success, canPublish, message, missing }.
   */
  async canPublishSemester(semesterId, options = {}) {
    const publishGroupId = options.publish_group_id != null ? Number(options.publish_group_id) : null;
    const departmentFilterRaw = options.department;
    const departmentFilter =
      typeof departmentFilterRaw === 'string' && departmentFilterRaw.trim()
        ? departmentFilterRaw.trim()
        : null;
    const { data: semester } = await supabase.from('semesters').select('session_id, name').eq('semester_id', semesterId).maybeSingle();
    if (!semester?.session_id) return this.handleResponse(null, { message: 'Semester not found.' });
    const sessionId = semester.session_id;
    const semesterName = (semester.name && String(semester.name).trim().toLowerCase()) || '';
    const isPostSiwes = semesterName.includes('post-siwes') || semesterName === 'post siwes';
    const isSummer = semesterName === 'summer' || semesterName.includes('summer');

    const { data: groupsRaw } = await supabase.from('class_groups').select('group_id, department, level, name').eq('session_id', sessionId).eq('status', 'active');
    let groups = groupsRaw || [];
    if (departmentFilter) {
      groups = groups.filter((g) => (g.department || '').trim() === departmentFilter);
    }
    if (publishGroupId != null) {
      groups = groups.filter((g) => Number(g.group_id) === publishGroupId);
      if (groups.length === 0) return this.handleResponse(null, { message: 'Selected group not found or inactive.' });
    }
    const { data: courses } = await supabase.from('courses').select('course_id, course_code, title, department, level, category, credit_units').eq('session_id', sessionId).eq('status', 'active');

    const checkHoursSemester = async (requiredHours) => {
      const schedRes = await this.getSchedulesWithDetails({ session_id: sessionId });
      const scheduleRows = (schedRes.success && Array.isArray(schedRes.data)) ? schedRes.data : [];
      const inThisSemester = scheduleRows.filter((row) => (row.semester_id ?? null) === semesterId);
      const toMinutes = (t) => {
        if (!t) return 0;
        const [h, m] = String(t).slice(0, 5).split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
      };
      const hoursByKey = new Map();
      for (const row of inThisSemester) {
        const key = `${row.class_group_id ?? row.group_id}-${row.course_id}`;
        const start = toMinutes(row.start_time);
        const end = toMinutes(row.end_time);
        const mins = end > start ? end - start : 0;
        hoursByKey.set(key, (hoursByKey.get(key) || 0) + mins);
      }
      const missing = [];
      for (const g of groups) {
        const dept = g.department || '';
        const lvl = g.level != null ? Number(g.level) : null;
        for (const c of courses || []) {
          if (c.category === 'GEDS' || c.category === 'SAT') continue;
          if ((c.department || '') !== dept) continue;
          if (lvl != null && c.level != null && Number(c.level) !== lvl) continue;
          const key = `${g.group_id}-${c.course_id}`;
          const totalMins = hoursByKey.get(key) || 0;
          if (totalMins < requiredHours * 60) {
            const groupLabel = g.name ? `${g.level}L ${g.department} Group ${g.name}` : `${g.level}L ${g.department}`;
            missing.push({
              group: groupLabel,
              course: c.course_code || c.title || 'Course',
              hoursScheduled: Math.round(totalMins / 60),
              required: requiredHours,
            });
          }
        }
      }
      return { missing, requiredHours };
    };

    if (isPostSiwes) {
      const required = ApiService.SEMESTER_HOURS.POST_SIWES_HOURS;
      const { missing } = await checkHoursSemester(required);
      if (missing.length > 0) {
        const list = missing.slice(0, 10).map((m) => `${m.course} (${m.group}): ${m.hoursScheduled ?? 0}/${m.required} hrs`).join('; ');
        return this.handleResponse({
          canPublish: false,
          message: `Cannot publish Post-SIWES timetable: each course must have ${required} hours scheduled per class. Missing or incomplete: ${list}${missing.length > 10 ? ` and ${missing.length - 10} more.` : '.'}`,
          missing,
        }, null);
      }
      return this.handleResponse({ canPublish: true, message: `All required courses have ${required} hours scheduled per class.` }, null);
    }

    if (isSummer) {
      const required = ApiService.SEMESTER_HOURS.SUMMER_HOURS;
      const { missing } = await checkHoursSemester(required);
      if (missing.length > 0) {
        const list = missing.slice(0, 10).map((m) => `${m.course} (${m.group}): ${m.hoursScheduled ?? 0}/${m.required} hrs`).join('; ');
        return this.handleResponse({
          canPublish: false,
          message: `Cannot publish Summer timetable: each course must have ${required} hours scheduled per class. Missing or incomplete: ${list}${missing.length > 10 ? ` and ${missing.length - 10} more.` : '.'}`,
          missing,
        }, null);
      }
      return this.handleResponse({ canPublish: true, message: `All required courses have ${required} hours scheduled per class.` }, null);
    }

    // First/Second: each (course, class) must have total scheduled hours >= course credit_units (2 or 3)
    const schedRes = await this.getSchedulesWithDetails({ session_id: sessionId });
    const scheduleRows = (schedRes.success && Array.isArray(schedRes.data)) ? schedRes.data : [];
    const inThisSemester = scheduleRows.filter((row) => (row.semester_id ?? null) === semesterId);
    const toMinutes = (t) => {
      if (!t) return 0;
      const [h, m] = String(t).slice(0, 5).split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const hoursByKey = new Map();
    for (const row of inThisSemester) {
      const key = `${row.class_group_id ?? row.group_id}-${row.course_id}`;
      const start = toMinutes(row.start_time);
      const end = toMinutes(row.end_time);
      const mins = end > start ? end - start : 0;
      hoursByKey.set(key, (hoursByKey.get(key) || 0) + mins);
    }
    const missing = [];
    for (const g of groups) {
      const dept = g.department || '';
      const lvl = g.level != null ? Number(g.level) : null;
      for (const c of courses || []) {
        if (c.category === 'GEDS' || c.category === 'SAT') continue;
        if ((c.department || '') !== dept) continue;
        if (lvl != null && c.level != null && Number(c.level) !== lvl) continue;
        const key = `${g.group_id}-${c.course_id}`;
        const requiredHrs = c.credit_units != null ? Number(c.credit_units) : ApiService.SEMESTER_HOURS.FIRST_SECOND_DEFAULT_HOURS;
        const requiredMins = requiredHrs * 60;
        const totalMins = hoursByKey.get(key) || 0;
        if (totalMins < requiredMins) {
          const groupLabel = g.name ? `${g.level}L ${g.department} Group ${g.name}` : `${g.level}L ${g.department}`;
          missing.push({
            group: groupLabel,
            course: c.course_code || c.title || 'Course',
            hoursScheduled: Math.round(totalMins / 60),
            required: requiredHrs,
          });
        }
      }
    }
    if (missing.length > 0) {
      const list = missing.slice(0, 10).map((m) => `${m.course} (${m.group}): ${m.hoursScheduled ?? 0}/${m.required} hrs`).join('; ');
      return this.handleResponse({
        canPublish: false,
        message: `Cannot publish: each course must have its required hours (by credit units) scheduled per class. Missing or incomplete: ${list}${missing.length > 10 ? ` and ${missing.length - 10} more.` : '.'}`,
        missing,
      }, null);
    }
    return this.handleResponse({ canPublish: true, message: 'All required courses have their required hours scheduled per class.' }, null);
  }

  async updateSemester(id, data) {
    if (data.status === 'active') {
      const { data: current } = await supabase.from('semesters').select('session_id').eq('semester_id', id).maybeSingle();
      if (current?.session_id) {
        await supabase.from('semesters').update({ status: 'inactive' }).eq('session_id', current.session_id).neq('semester_id', id);
      }
    }
    if (data.timetable_status === 'published') {
      const check = await this.canPublishSemester(id, { publish_group_id: data.publish_group_id });
      if (check.success && check.data && !check.data.canPublish) {
        return this.handleResponse(null, { message: check.data.message || 'Schedule all courses before publishing.' });
      }
    }
    const { publish_group_id: _publishGroupId, ...updatePayload } = data;
    const { data: res, error } = await supabase.from('semesters').update(updatePayload).eq('semester_id', id).select().single();
    return this.handleResponse(res, error);
  }

  async deleteSemester(id) {
    const { data, error } = await supabase.from('semesters').delete().eq('semester_id', id);
    return this.handleResponse(data, error);
  }

  /** Delete all semesters with status 'inactive'. Returns { success, deletedCount } or error. */
  async deleteInactiveSemesters() {
    const { data: list, error: listErr } = await supabase.from('semesters').select('semester_id').eq('status', 'inactive');
    if (listErr) return this.handleResponse(null, listErr);
    const ids = (list || []).map((r) => r.semester_id).filter(Boolean);
    if (ids.length === 0) return this.handleResponse({ deletedCount: 0 }, null);
    const { error: delErr } = await supabase.from('semesters').delete().in('semester_id', ids);
    if (delErr) return this.handleResponse(null, delErr);
    return this.handleResponse({ deletedCount: ids.length }, null);
  }

  // =====================================================
  // CLASS GROUPS
  // =====================================================

  async getClassGroups(params = {}) {
    let q = supabase.from('class_groups').select('*');
    for (const [k, v] of Object.entries(params || {})) {
      if (k === 'limit' || k === 'page') continue;
      q = q.eq(k, v);
    }
    const { data, error } = await q;
    return this.handleResponse(data, error);
  }

  async getClassGroupById(id) {
    const { data, error } = await supabase.from('class_groups').select('*').eq('group_id', id).maybeSingle();
    return this.handleResponse(data, error);
  }

  async createClassGroup(data) {
    const { data: res, error } = await supabase.from('class_groups').insert([data]).select().single();
    return this.handleResponse(res, error);
  }

  async updateClassGroup(id, data) {
    // Unique constraint is (name, department, session_id, level). Pre-check to avoid 409 and return a clear error.
    const idNum = Number(id);
    const name = data.name != null ? String(data.name).trim() : null;
    const department = data.department != null ? String(data.department).trim() : null;
    const session_id = data.session_id != null ? data.session_id : null;
    const level = data.level != null ? data.level : null;
    if (name != null || department != null || session_id != null || level != null) {
      const { data: current, error: fetchErr } = await supabase.from('class_groups').select('name, department, session_id, level').eq('group_id', idNum).maybeSingle();
      if (fetchErr) return this.handleResponse(null, fetchErr);
      const targetName = name ?? current?.name ?? '';
      const targetDept = department ?? current?.department ?? '';
      const targetSession = session_id ?? current?.session_id ?? null;
      const targetLevel = level ?? current?.level ?? null;
      let q = supabase.from('class_groups').select('group_id').eq('name', targetName).eq('department', targetDept).neq('group_id', idNum);
      if (targetSession == null) q = q.is('session_id', null);
      else q = q.eq('session_id', targetSession);
      if (targetLevel == null) q = q.is('level', null);
      else q = q.eq('level', targetLevel);
      const { data: existingRow, error: checkErr } = await q.limit(1).maybeSingle();
      if (checkErr) return this.handleResponse(null, checkErr);
      if (existingRow) {
        return this.handleResponse(null, { message: 'A class group with this name and level already exists in this department for this session. Use a different group name or level.' });
      }
    }
    const { data: res, error } = await supabase.from('class_groups').update(data).eq('group_id', idNum).select().single();
    return this.handleResponse(res, error);
  }

  async deleteClassGroup(id) {
    const { data, error } = await supabase.from('class_groups').delete().eq('group_id', id);
    return this.handleResponse(data, error);
  }

  // =====================================================
  // CLASS TO COURSE MAPPING (Class to Course Management)
  // =====================================================

  /** Get mappings for (session, optional department, optional level). Returns rows with mapping_id, session_id, department, level, course_id. */
  async getClassCourseMappings(sessionId, opts = {}) {
    let q = supabase.from('class_course_mapping').select('*').eq('session_id', sessionId);
    if (opts.department != null && opts.department !== '') q = q.eq('department', opts.department);
    if (opts.level != null && opts.level !== '') q = q.eq('level', Number(opts.level));
    const { data, error } = await q.order('level').order('course_id');
    return this.handleResponse(data, error);
  }

  /** Set course mappings for a class (session, department, level). Replaces any existing. courseIds = array of course_id. */
  async setClassCourseMappings(sessionId, department, level, courseIds) {
    const dept = String(department).trim();
    const lvl = Number(level);
    if (!sessionId || !dept || (lvl !== 0 && !lvl)) return this.handleResponse(null, { message: 'session_id, department, and level are required.' });
    const { error: delErr } = await supabase.from('class_course_mapping').delete().eq('session_id', sessionId).eq('department', dept).eq('level', lvl);
    if (delErr) return this.handleResponse(null, delErr);
    const ids = Array.isArray(courseIds) ? courseIds.map((id) => Number(id)).filter((n) => !Number.isNaN(n) && n > 0) : [];
    if (ids.length === 0) return this.handleResponse({ deleted: true, count: 0 }, null);
    const rows = ids.map((course_id) => ({ session_id: sessionId, department: dept, level: lvl, course_id }));
    const { data, error } = await supabase.from('class_course_mapping').insert(rows).select();
    return this.handleResponse(data, error);
  }

  /** Get course_ids allowed for (session, department, level). Returns null if no mappings (show all courses); otherwise array of course_id. */
  async getCourseIdsForClass(sessionId, department, level) {
    if (!sessionId || department == null || department === '' || level == null || level === '') return null;
    const lvl = Number(level);
    if (Number.isNaN(lvl)) return null;
    const { data, error } = await supabase
      .from('class_course_mapping')
      .select('course_id')
      .eq('session_id', sessionId)
      .eq('department', String(department).trim())
      .eq('level', lvl);
    if (error) return null;
    if (!Array.isArray(data) || data.length === 0) return null;
    return data.map((r) => r.course_id);
  }

  // =====================================================
  // TIMETABLES
  // =====================================================

  async getTimetables(params = {}) {
    let q = supabase.from('timetables').select('*');
    for (const [k, v] of Object.entries(params || {})) {
      if (k === 'limit' || k === 'page') continue;
      q = q.eq(k, v);
    }
    const { data, error } = await q;
    return this.handleResponse(data, error);
  }

  async getTimetableById(id) {
    const { data, error } = await supabase.from('timetables').select('*').eq('timetable_id', id).maybeSingle();
    return this.handleResponse(data, error);
  }

  async createTimetable(data) {
    const { data: res, error } = await supabase.from('timetables').insert([data]).select().single();
    return this.handleResponse(res, error);
  }

  async updateTimetable(id, data) {
    const { data: res, error } = await supabase.from('timetables').update(data).eq('timetable_id', id).select().single();
    return this.handleResponse(res, error);
  }

  async deleteTimetable(id) {
    const { data, error } = await supabase.from('timetables').delete().eq('timetable_id', id);
    return this.handleResponse(data, error);
  }

  async submitTimetable(id) {
    const { data, error } = await supabase.from('timetables').update({ status: 'submitted' }).eq('timetable_id', id).select().single();
    return this.handleResponse(data, error);
  }

  // =====================================================
  // SCHEDULES
  // =====================================================

  async getSchedules(params = {}) {
    const { expand, ...rest } = params;
    if (expand) {
      return this.getSchedulesWithDetails(rest);
    }
    let q = supabase.from('schedules').select('*');
    for (const [k, v] of Object.entries(rest || {})) {
      if (k === 'limit' || k === 'page') continue;
      q = q.eq(k, v);
    }
    const { data, error } = await q;
    return this.handleResponse(data, error);
  }

  /** Get schedules with joined time_slots, courses, lecturers, venues, class_groups for display.
   * When for_department_view=true and department is set: only return schedules with created_by_role = 'department-officer'
   * (so department officers do not see schedules created by the school officer; conflict checks still use all schedules).
   */
  async getSchedulesWithDetails(params = {}) {
    const scheduleColumns = ['schedule_id', 'course_id', 'lecturer_id', 'venue_id', 'slot_id', 'session_id', 'group_id', 'status', 'semester_id'];
    const department = params.department;
    const forDepartmentView = params.for_department_view === true;
    const rest = { ...params };
    delete rest.expand;
    delete rest.department;
    delete rest.for_department_view;

    const classGroupsSelect = department
      ? 'class_groups!inner(name, level, department)'
      : 'class_groups(name, level, department)';
    let q = supabase
      .from('schedules')
      .select(`
        schedule_id,
        course_id,
        lecturer_id,
        venue_id,
        slot_id,
        session_id,
        group_id,
        status,
        semester_id,
        created_by_role,
        time_slots(day_of_week, start_time, end_time),
        courses(course_code, title, category),
        lecturers(name),
        venues(name),
        ${classGroupsSelect}
      `)
      .eq('status', 'scheduled');
    if (department) q = q.eq('class_groups.department', department);
    if (forDepartmentView && department) q = q.eq('created_by_role', 'department-officer');
    for (const [k, v] of Object.entries(rest || {})) {
      if (k === 'limit' || k === 'page') continue;
      if (v != null && v !== '' && scheduleColumns.includes(k)) q = q.eq(k, v);
    }
    if (params?.limit) q = q.limit(params.limit);
    const { data, error } = await q;
    if (error) return this.handleResponse(null, error);
    const mapped = (data || []).map((row) => {
      const slot = row.time_slots || {};
      const course = row.courses || {};
      const lecturer = row.lecturers || {};
      const venue = row.venues || {};
      const group = row.class_groups || {};
      const formatTime = (t) => (t ? String(t).slice(0, 5) : '');
      return {
        id: row.schedule_id,
        schedule_id: row.schedule_id,
        course_id: row.course_id,
        lecturer_id: row.lecturer_id,
        venue_id: row.venue_id,
        class_group_id: row.group_id,
        day: slot.day_of_week || '',
        day_of_week: slot.day_of_week || '',
        start_time: formatTime(slot.start_time),
        end_time: formatTime(slot.end_time),
        lecturer_name: lecturer.name || '—',
        course_code: course.course_code || '—',
        course_title: course.title,
        course_name: course.title || course.course_code || '—',
        course_category: course.category || null,
        class_name: group.name || '—',
        group_name: group.name || '—',
        group_level: group.level,
        group_department: group.department,
        venue_name: venue.name || '—',
        session_id: row.session_id,
        status: row.status,
        semester_id: row.semester_id ?? null,
      };
    });
    return this.handleResponse(mapped, null);
  }

  async getScheduleById(id) {
    const { data, error } = await supabase.from('schedules').select('*').eq('schedule_id', id).maybeSingle();
    return this.handleResponse(data, error);
  }

  /** Get semester IDs that run concurrently with the given semester (share the same venue pool). Summer and Post-SIWES run together; First/Second are alone. Returns array of semester_id or null if no filter. */
  async _getConcurrentSemesterIds(sessionId, semesterId) {
    if (semesterId == null) return null;
    const { data: semester } = await supabase.from('semesters').select('semester_id, name').eq('semester_id', semesterId).maybeSingle();
    if (!semester) return [semesterId];
    const name = (semester.name || '').trim().toLowerCase();
    const isSummer = name === 'summer' || name.includes('summer');
    const isPostSiwes = name.includes('post-siwes') || name === 'post siwes';
    if (isSummer || isPostSiwes) {
      const { data: list } = await supabase.from('semesters').select('semester_id, name').eq('session_id', sessionId);
      const ids = (list || []).filter((s) => {
        const n = (s.name || '').trim().toLowerCase();
        return n === 'summer' || n.includes('summer') || n.includes('post-siwes') || n === 'post siwes';
      }).map((s) => s.semester_id).filter(Boolean);
      return ids.length ? ids : [semesterId];
    }
    return [semesterId];
  }

  /** Check if a venue is already in use for the same session, day, and overlapping time. When semesterId is set, only schedules in that semester or concurrent semesters (Summer+Post-SIWES) block; ended semesters' venues are open. Returns { success, conflict, message }. */
  async checkVenueConflict(sessionId, venueId, day, startTime, endTime, excludeScheduleId = null, semesterId = null) {
    const res = await this.getSchedulesWithDetails({ session_id: sessionId });
    if (!res.success || !Array.isArray(res.data)) return { success: true, conflict: false };
    let rows = res.data;
    if (semesterId != null) {
      const concurrentIds = await this._getConcurrentSemesterIds(sessionId, semesterId);
      if (Array.isArray(concurrentIds) && concurrentIds.length > 0) {
        rows = rows.filter((row) => row.semester_id == null || concurrentIds.includes(row.semester_id));
      }
    }
    const start = String(startTime).slice(0, 5);
    const end = String(endTime).slice(0, 5);
    const toMinutes = (t) => {
      const [h, m] = String(t).slice(0, 5).split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const s1 = toMinutes(start);
    const e1 = toMinutes(end);
    for (const row of rows) {
      if (row.venue_id !== venueId) continue;
      if (row.day_of_week !== day && row.day !== day) continue;
      if (excludeScheduleId != null && (row.schedule_id === excludeScheduleId || row.id === excludeScheduleId)) continue;
      const s2 = toMinutes(row.start_time);
      const e2 = toMinutes(row.end_time);
      if (s1 < e2 && e1 > s2) {
        const dept = row.group_department || row.class_department || 'another department';
        const course = row.course_code || row.course_name || 'a course';
        return {
          success: true,
          conflict: true,
          message: `This venue is already in use by another class (${dept}: ${course}) at ${row.day_of_week || row.day} ${row.start_time}–${row.end_time}. A venue cannot be assigned to more than one class at the same time. Please choose another venue or time.`,
        };
      }
    }
    return { success: true, conflict: false };
  }

  /**
   * Class day limits: max 6 hours total per class per day; max 3 hours in any single continuous stretch.
   * Returns { success, conflict, message }.
   */
  async checkClassDayLimits(sessionId, groupId, day, startTime, endTime, excludeScheduleId = null, semesterId = null) {
    const MAX_HOURS_PER_DAY = 6;
    const MAX_HOURS_STRETCH = 3;
    const toMinutes = (t) => {
      const [h, m] = String(t).slice(0, 5).split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const res = await this.getSchedulesWithDetails({ session_id: sessionId, group_id: groupId });
    let rows = (res.success && Array.isArray(res.data)) ? res.data : [];
    if (semesterId != null) {
      const concurrentIds = await this._getConcurrentSemesterIds(sessionId, semesterId);
      if (Array.isArray(concurrentIds) && concurrentIds.length > 0) {
        rows = rows.filter((row) => row.semester_id == null || concurrentIds.includes(row.semester_id));
      } else {
        rows = rows.filter((row) => row.semester_id == null || row.semester_id === semesterId);
      }
    }
    let intervals = [];
    for (const row of rows) {
      if ((row.day_of_week || row.day) !== day) continue;
      if (excludeScheduleId != null && (row.schedule_id === excludeScheduleId || row.id === excludeScheduleId)) continue;
      const s = toMinutes(row.start_time);
      const e = toMinutes(row.end_time);
      if (e > s) intervals.push([s, e]);
    }
    const { data: ncCourses } = await supabase.from('courses').select('course_id, assignment').in('category', ['GEDS', 'SAT']).eq('session_id', sessionId);
    const forGroup = (ncCourses || []).filter((c) => {
      const a = typeof c.assignment === 'string' ? (() => { try { return JSON.parse(c.assignment); } catch (_) { return {}; } })() : (c.assignment || {});
      return Number(a.class_group_id) === Number(groupId);
    });
    for (const c of forGroup) {
      const a = typeof c.assignment === 'string' ? (() => { try { return JSON.parse(c.assignment); } catch (_) { return {}; } })() : (c.assignment || {});
      if ((a.day_of_week || '') !== day || !a.start_time || !a.end_time) continue;
      const s = toMinutes(a.start_time);
      const e = toMinutes(a.end_time);
      if (e > s) intervals.push([s, e]);
    }
    const newStart = toMinutes(String(startTime).slice(0, 5));
    const newEnd = toMinutes(String(endTime).slice(0, 5));
    if (newEnd > newStart) intervals.push([newStart, newEnd]);
    if (intervals.length === 0) return { success: true, conflict: false };
    intervals.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const [s, e] of intervals) {
      if (merged.length === 0) {
        merged.push([s, e]);
        continue;
      }
      const last = merged[merged.length - 1];
      if (s <= last[1]) {
        last[1] = Math.max(last[1], e);
      } else {
        merged.push([s, e]);
      }
    }
    let totalMins = 0;
    for (const [s, e] of merged) {
      totalMins += e - s;
      const stretchHours = (e - s) / 60;
      if (stretchHours > MAX_HOURS_STRETCH) {
        return {
          success: true,
          conflict: true,
          message: `This class would have a continuous block of ${stretchHours.toFixed(1)} hours on ${day} (maximum ${MAX_HOURS_STRETCH} hours at a stretch allowed). Split the schedule or choose a different time.`,
        };
      }
    }
    if (totalMins > MAX_HOURS_PER_DAY * 60) {
      return {
        success: true,
        conflict: true,
        message: `This class would have ${(totalMins / 60).toFixed(1)} hours on ${day} (maximum ${MAX_HOURS_PER_DAY} hours per day per class). Choose another day or remove another slot.`,
      };
    }
    return { success: true, conflict: false };
  }

  /**
   * Check if this class group already has something at this day/time (computing schedule or non-computing course).
   * Elective courses can be scheduled at the same time as other electives (students choose one).
   * Use this so computing timetables don't clash with GEDS/SAT slots added in Non-Computing Course Management.
   * Returns { success, conflict, message }.
   * @param {number} [courseId] - If provided and the course is Elective, overlap with another Elective is allowed.
   */
  async checkClassGroupTimeConflict(sessionId, groupId, day, startTime, endTime, excludeScheduleId = null, courseId = null) {
    const start = String(startTime).slice(0, 5);
    const end = String(endTime).slice(0, 5);
    const toMinutes = (t) => {
      const [h, m] = String(t).slice(0, 5).split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const s1 = toMinutes(start);
    const e1 = toMinutes(end);
    const overlaps = (d2, start2, end2) => {
      if (d2 !== day) return false;
      const s2 = toMinutes(String(start2).slice(0, 5));
      const e2 = toMinutes(String(end2).slice(0, 5));
      return s1 < e2 && e1 > s2;
    };

    let newCourseCategory = null;
    if (courseId != null) {
      const { data: courseRow } = await supabase.from('courses').select('category').eq('course_id', courseId).maybeSingle();
      newCourseCategory = courseRow?.category || null;
    }

    const res = await this.getSchedulesWithDetails({ session_id: sessionId, group_id: groupId });
    if (res.success && Array.isArray(res.data)) {
      for (const row of res.data) {
        if (excludeScheduleId != null && (row.schedule_id === excludeScheduleId || row.id === excludeScheduleId)) continue;
        if (overlaps(row.day_of_week || row.day, row.start_time, row.end_time)) {
          const existingElective = (row.course_category || '').toString() === 'Elective';
          const newElective = (newCourseCategory || '').toString() === 'Elective';
          if (existingElective && newElective) {
            continue;
          }
          const levelDept = [row.group_level, row.group_department].filter(Boolean).length ? ` (${row.group_level ?? '?'}, ${row.group_department ?? '?'})` : '';
          return {
            success: true,
            conflict: true,
            message: `This class${levelDept} is already scheduled at ${row.day_of_week || row.day} ${row.start_time}–${row.end_time} (${row.course_code || 'course'}). Choose another time.`,
          };
        }
      }
    }

    const { data: ncCourses } = await supabase
      .from('courses')
      .select('course_id, course_code, title, assignment')
      .in('category', ['GEDS', 'SAT'])
      .eq('session_id', sessionId);
    const forGroup = (ncCourses || []).filter((c) => {
      const a = typeof c.assignment === 'string' ? (() => { try { return JSON.parse(c.assignment); } catch (_) { return {}; } })() : (c.assignment || {});
      return Number(a.class_group_id) === Number(groupId);
    });
    for (const c of forGroup) {
      const a = typeof c.assignment === 'string' ? (() => { try { return JSON.parse(c.assignment); } catch (_) { return {}; } })() : (c.assignment || {});
      if (!a.day_of_week || !a.start_time || !a.end_time) continue;
      if (overlaps(a.day_of_week, a.start_time, a.end_time)) {
        const levelDept = [a.level, a.department].filter(Boolean).length ? ` ${a.level ?? '?'}, ${a.department ?? '?'}` : '';
        return {
          success: true,
          conflict: true,
          message: `This class${levelDept} has a non-computing course (${c.course_code || c.title || 'GEDS/SAT'}) at ${a.day_of_week} ${String(a.start_time).slice(0, 5)}–${String(a.end_time).slice(0, 5)}. Choose another time so it doesn't clash.`,
        };
      }
    }
    return { success: true, conflict: false };
  }

  /**
   * Check if a lecturer is already scheduled at the same day and overlapping time (any session/department).
   * Rule: A lecturer must not be scheduled for more than one class at the same time.
   * Returns { success, conflict, message }.
   */
  async checkLecturerTimeConflict(sessionId, lecturerId, day, startTime, endTime, excludeScheduleId = null) {
    const res = await this.getSchedulesWithDetails({ session_id: sessionId });
    if (!res.success || !Array.isArray(res.data)) return { success: true, conflict: false };
    const start = String(startTime).slice(0, 5);
    const end = String(endTime).slice(0, 5);
    const toMinutes = (t) => {
      const [h, m] = String(t).slice(0, 5).split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const s1 = toMinutes(start);
    const e1 = toMinutes(end);
    for (const row of res.data) {
      if (row.lecturer_id !== lecturerId) continue;
      if (row.day_of_week !== day && row.day !== day) continue;
      if (excludeScheduleId != null && (row.schedule_id === excludeScheduleId || row.id === excludeScheduleId)) continue;
      const s2 = toMinutes(row.start_time);
      const e2 = toMinutes(row.end_time);
      if (s1 < e2 && e1 > s2) {
        const course = row.course_code || row.course_name || 'a course';
        return {
          success: true,
          conflict: true,
          message: `This lecturer is already scheduled at that time for ${course} (${row.day_of_week || row.day} ${row.start_time}–${row.end_time}). A lecturer cannot be in two places at once. Choose another time or lecturer.`,
        };
      }
    }
    return { success: true, conflict: false };
  }

  /**
   * Check if (course, class group) is at limit for the week.
   * - First/Second semester: total hours per (course, group) must not exceed course credit_units (2 or 3); course disappears after that.
   * - Summer semester: max 2 hours total per (course, group).
   * - Post-SIWES semester: max 6 hours total per (course, group).
   * When semesterId is provided, only schedules in that semester are counted.
   * Returns { success: true, overLimit: true, message } when at limit; otherwise { success: true, overLimit: false }.
   */
  async checkCourseHoursForGroup(sessionId, courseId, classGroupId, durationHours, excludeScheduleId = null, semesterId = null) {
    let isPostSiwes = false;
    let isSummer = false;
    if (semesterId != null) {
      const { data: sem } = await supabase.from('semesters').select('name').eq('semester_id', semesterId).maybeSingle();
      const name = (sem && sem.name) ? String(sem.name).trim().toLowerCase() : '';
      isPostSiwes = name.includes('post-siwes') || name === 'post siwes';
      isSummer = name === 'summer' || name.includes('summer');
    }

    const res = await this.getSchedulesWithDetails({ session_id: sessionId, course_id: courseId, group_id: classGroupId });
    if (!res.success || !Array.isArray(res.data)) return { success: true, overLimit: false };

    // When checking by semester, only count schedules in that semester
    let rows = res.data;
    if (semesterId != null) {
      rows = rows.filter((row) => (row.semester_id ?? null) === semesterId);
    }

    const toMinutes = (t) => {
      if (!t) return 0;
      const [h, m] = String(t).slice(0, 5).split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const { POST_SIWES_HOURS, SUMMER_HOURS } = ApiService.SEMESTER_HOURS;

    if (isPostSiwes) {
      let totalMinutes = 0;
      for (const row of rows) {
        if (excludeScheduleId != null && (row.schedule_id === excludeScheduleId || row.id === excludeScheduleId)) continue;
        const start = toMinutes(row.start_time);
        const end = toMinutes(row.end_time);
        if (end > start) totalMinutes += end - start;
      }
      const durationMins = (typeof durationHours === 'number' ? durationHours * 60 : 0) || 0;
      const maxMinutes = POST_SIWES_HOURS * 60;
      if (totalMinutes >= maxMinutes) {
        return {
          success: true,
          overLimit: true,
          message: `This course has already reached the ${POST_SIWES_HOURS}-hour total for this class in Post-SIWES semester. It cannot be scheduled again for this group.`,
        };
      }
      if (totalMinutes + durationMins > maxMinutes) {
        return {
          success: true,
          overLimit: true,
          message: `This course would exceed ${POST_SIWES_HOURS} hours total for this class (Post-SIWES). Currently ${Math.round(totalMinutes / 60)} hour(s) scheduled; ${POST_SIWES_HOURS} hours maximum.`,
        };
      }
      return { success: true, overLimit: false };
    }

    if (isSummer) {
      let totalMinutes = 0;
      for (const row of rows) {
        if (excludeScheduleId != null && (row.schedule_id === excludeScheduleId || row.id === excludeScheduleId)) continue;
        const start = toMinutes(row.start_time);
        const end = toMinutes(row.end_time);
        if (end > start) totalMinutes += end - start;
      }
      const durationMins = (typeof durationHours === 'number' ? durationHours * 60 : 0) || 0;
      const maxMinutes = SUMMER_HOURS * 60;
      if (totalMinutes >= maxMinutes) {
        return {
          success: true,
          overLimit: true,
          message: `This course has already reached the ${SUMMER_HOURS}-hour total for this class in Summer semester. It cannot be scheduled again for this group.`,
        };
      }
      if (totalMinutes + durationMins > maxMinutes) {
        return {
          success: true,
          overLimit: true,
          message: `This course would exceed ${SUMMER_HOURS} hours total for this class (Summer). Currently ${Math.round(totalMinutes / 60)} hour(s) scheduled; ${SUMMER_HOURS} hours maximum.`,
        };
      }
      return { success: true, overLimit: false };
    }

    // First/Second: required hours = course credit_units (e.g. 2 or 3); default 2
    const { data: courseRow } = await supabase.from('courses').select('credit_units').eq('course_id', courseId).maybeSingle();
    const requiredHours = courseRow?.credit_units != null ? Number(courseRow.credit_units) : ApiService.SEMESTER_HOURS.FIRST_SECOND_DEFAULT_HOURS;
    const requiredMinutes = requiredHours * 60;
    let totalMinutes = 0;
    for (const row of rows) {
      if (excludeScheduleId != null && (row.schedule_id === excludeScheduleId || row.id === excludeScheduleId)) continue;
      const start = toMinutes(row.start_time);
      const end = toMinutes(row.end_time);
      if (end > start) totalMinutes += end - start;
    }
    const durationMins = (typeof durationHours === 'number' ? durationHours * 60 : 0) || 0;
    const maxMinutes = requiredMinutes;
    if (totalMinutes >= maxMinutes) {
      return {
        success: true,
        overLimit: true,
        message: `This course has already reached the required ${requiredHours} hour(s) for this class (First/Second). It cannot be scheduled again for this group.`,
      };
    }
    if (totalMinutes + durationMins > maxMinutes) {
      return {
        success: true,
        overLimit: true,
        message: `This course would exceed ${requiredHours} hour(s) total for this class (First/Second). Currently ${Math.round(totalMinutes / 60)} hour(s) scheduled; ${requiredHours} hour(s) maximum.`,
      };
    }
    return { success: true, overLimit: false };
  }

  /** For (session, course, group), if any schedules exist, they must all use the same lecturer. Returns that lecturer_id or null if none. */
  async _getRequiredLecturerForCourseGroup(sessionId, courseId, groupId, excludeScheduleId = null) {
    if (sessionId == null || courseId == null || groupId == null) return null;
    const { data: rows } = await supabase
      .from('schedules')
      .select('schedule_id, lecturer_id')
      .eq('session_id', sessionId)
      .eq('course_id', courseId)
      .eq('group_id', groupId);
    const list = (rows || []).filter((r) => excludeScheduleId == null || (r.schedule_id !== excludeScheduleId && r.id !== excludeScheduleId));
    const ids = [...new Set(list.map((r) => r.lecturer_id).filter((id) => id != null))];
    if (ids.length === 0) return null;
    if (ids.length > 1) return ids[0]; // inconsistent data; require matching first
    return ids[0];
  }

  async createSchedule(data) {
    // Enforces: same lecturer for same course+class; no venue double-book; no class overlap; no lecturer double-book; venue capacity >= class size
    const hasSlot = data.slot_id != null;
    const hasDayTime = data.session_id != null && data.day && data.start_time && (data.end_time != null || data.duration_hours != null);
    const groupId = data.group_id ?? data.class_group_id ?? null;
    if (groupId != null && data.session_id != null && data.course_id != null) {
      const requiredLecturer = await this._getRequiredLecturerForCourseGroup(data.session_id, data.course_id, groupId, null);
      if (requiredLecturer != null && Number(data.lecturer_id) !== Number(requiredLecturer)) {
        return this.handleResponse(null, { message: 'This course is already scheduled for this class with a different lecturer. All slots for the same course and class must use the same lecturer.' });
      }
    }
    if (hasSlot) {
      const { data: slotRow } = await supabase.from('time_slots').select('day_of_week, start_time, end_time').eq('slot_id', data.slot_id).maybeSingle();
      if (!slotRow) return this.handleResponse(null, { message: 'Invalid slot_id. Time slot not found.' });
      const day = slotRow.day_of_week;
      const startStr = String(slotRow.start_time).slice(0, 5);
      const endStr = String(slotRow.end_time).slice(0, 5);
      const slotSemesterId = data.semester_id ?? null;
      const venueCheck = await this.checkVenueConflict(data.session_id, data.venue_id, day, startStr, endStr, null, slotSemesterId);
      if (venueCheck.conflict) return this.handleResponse(null, { message: venueCheck.message });
      const classCheck = await this.checkClassGroupTimeConflict(data.session_id, groupId, day, startStr, endStr, null, data.course_id);
      if (classCheck.conflict) return this.handleResponse(null, { message: classCheck.message });
      const lecturerCheck = await this.checkLecturerTimeConflict(data.session_id, data.lecturer_id, day, startStr, endStr, null);
      if (lecturerCheck.conflict) return this.handleResponse(null, { message: lecturerCheck.message });
      const dayLimitsCheck = await this.checkClassDayLimits(data.session_id, groupId, day, startStr, endStr, null, slotSemesterId);
      if (dayLimitsCheck.conflict) return this.handleResponse(null, { message: dayLimitsCheck.message });
      let classSize = 0;
      if (data.class_group_id) {
        const { data: grp } = await supabase.from('class_groups').select('student_count').eq('group_id', data.class_group_id).maybeSingle();
        if (grp?.student_count != null) classSize = grp.student_count;
      }
      const { data: venueRow } = await supabase.from('venues').select('capacity').eq('venue_id', data.venue_id).maybeSingle();
      const venueCapacity = venueRow?.capacity != null ? Number(venueRow.capacity) : 0;
      if (classSize > 0 && venueCapacity > 0 && classSize > venueCapacity) {
        return this.handleResponse(null, { message: `Venue capacity (${venueCapacity}) is less than class size (${classSize}). Choose a larger venue.` });
      }
      const insertData = { ...data };
      if (insertData.class_group_id != null && insertData.group_id == null) insertData.group_id = insertData.class_group_id;
      if (insertData.created_by_role != null) { /* pass through */ } else delete insertData.created_by_role;
      const { data: res, error } = await supabase.from('schedules').insert([insertData]).select().single();
      if (error) return this.handleResponse(null, error);
      await this._logAudit('schedules', res.schedule_id, 'INSERT', { course_id: data.course_id, lecturer_id: data.lecturer_id, venue_id: data.venue_id, group_id: data.class_group_id || data.group_id });
      return this.handleResponse(res, null);
    }
    if (hasDayTime) {
      const startStr = String(data.start_time).slice(0, 5);
      const durationHours = data.duration_hours ?? (data.start_time && data.end_time
        ? this._hoursBetween(data.start_time, data.end_time)
        : 1);
      const endStr = data.end_time ? String(data.end_time).slice(0, 5) : this._endTimeFromStartAndDuration(startStr, durationHours);
      const semesterId = data.semester_id ?? null;
      const hoursCheck = await this.checkCourseHoursForGroup(data.session_id, data.course_id, data.class_group_id, durationHours, null, semesterId);
      if (hoursCheck.overLimit) return this.handleResponse(null, { message: hoursCheck.message });
      const venueCheck = await this.checkVenueConflict(data.session_id, data.venue_id, data.day, startStr, endStr, null, semesterId);
      if (venueCheck.conflict) return this.handleResponse(null, { message: venueCheck.message });
      const classCheck = await this.checkClassGroupTimeConflict(data.session_id, data.class_group_id, data.day, startStr, endStr, null, data.course_id);
      if (classCheck.conflict) return this.handleResponse(null, { message: classCheck.message });
      const lecturerCheck = await this.checkLecturerTimeConflict(data.session_id, data.lecturer_id, data.day, startStr, endStr, null);
      if (lecturerCheck.conflict) return this.handleResponse(null, { message: lecturerCheck.message });
      const dayLimitsCheck = await this.checkClassDayLimits(data.session_id, data.class_group_id, data.day, startStr, endStr, null, semesterId);
      if (dayLimitsCheck.conflict) return this.handleResponse(null, { message: dayLimitsCheck.message });
      let classSize = 0;
      if (data.class_group_id) {
        const { data: grp } = await supabase.from('class_groups').select('student_count').eq('group_id', data.class_group_id).maybeSingle();
        if (grp?.student_count != null) classSize = grp.student_count;
      }
      const { data: venueRow } = await supabase.from('venues').select('capacity').eq('venue_id', data.venue_id).maybeSingle();
      const venueCapacity = venueRow?.capacity != null ? Number(venueRow.capacity) : 0;
      if (classSize > 0 && venueCapacity > 0 && classSize > venueCapacity) {
        return this.handleResponse(null, { message: `Venue capacity (${venueCapacity}) is less than class size (${classSize}). Choose a larger venue.` });
      }
      const slotId = await this._getOrCreateTimeSlot(data.day, startStr, endStr);
      if (!slotId) return this.handleResponse(null, { message: 'Could not get or create time slot. Run the SQL in supabase/run_get_or_create_time_slot.sql in Supabase Dashboard → SQL Editor (see supabase/README_MIGRATIONS.md).' });
      const insertPayload = {
        session_id: data.session_id,
        course_id: data.course_id,
        lecturer_id: data.lecturer_id,
        venue_id: data.venue_id,
        slot_id: slotId,
        group_id: data.class_group_id || null,
        timetable_id: data.timetable_id || null,
        notes: data.notes || null,
        class_size: classSize,
        status: 'scheduled',
      };
      if (semesterId != null) insertPayload.semester_id = semesterId;
      if (data.created_by_role != null) insertPayload.created_by_role = data.created_by_role;
      const { data: res, error } = await supabase.from('schedules').insert([insertPayload]).select().single();
      if (error) return this.handleResponse(null, error);
      await this._logAudit('schedules', res.schedule_id, 'INSERT', { course_id: data.course_id, lecturer_id: data.lecturer_id, venue_id: data.venue_id, group_id: data.class_group_id || null });
      return this.handleResponse({
        ...res,
        id: res.schedule_id,
        day: data.day,
        start_time: startStr,
        end_time: endStr,
      }, null);
    }
    return this.handleResponse(null, { message: 'createSchedule: provide either slot_id or (session_id, day, start_time, end_time or duration_hours)' });
  }

  _endTimeFromStartAndDuration(startTime, durationHours) {
    const [h, m] = String(startTime).slice(0, 5).split(':').map(Number);
    const totalMins = (h || 0) * 60 + (m || 0) + Math.round(durationHours * 60);
    const eh = Math.floor(totalMins / 60) % 24;
    const em = totalMins % 60;
    return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
  }

  _hoursBetween(start, end) {
    const [sh, sm] = String(start).split(':').map(Number);
    const [eh, em] = String(end).split(':').map(Number);
    return (eh - sh) + (em - sm) / 60;
  }

  async _getOrCreateTimeSlot(dayOfWeek, startTime, endTime) {
    const start = String(startTime).slice(0, 5);
    const end = String(endTime).slice(0, 5);
    // Use RPC only (no direct time_slots access) so DTTO can create schedules without RLS 403
    const { data: slotId, error } = await supabase.rpc('get_or_create_time_slot', {
      p_day_of_week: dayOfWeek,
      p_start_time: start,
      p_end_time: end,
    });
    if (error) return null;
    return slotId ?? null;
  }

  async updateSchedule(id, data) {
    let payload = { ...data };
    delete payload.created_by_role; // do not allow changing who created the schedule
    if (payload.class_group_id != null) {
      payload.group_id = payload.class_group_id;
      delete payload.class_group_id;
    }
    const existing = (await this.getScheduleById(id)).data;
    const sessionId = payload.session_id ?? existing?.session_id;
    const courseId = payload.course_id ?? existing?.course_id;
    const groupId = payload.group_id ?? payload.class_group_id ?? existing?.group_id;
    const effectiveLecturer = payload.lecturer_id ?? existing?.lecturer_id;
    const effectiveVenue = payload.venue_id ?? existing?.venue_id;
    if (sessionId != null && courseId != null && groupId != null && effectiveLecturer != null) {
      const requiredLecturer = await this._getRequiredLecturerForCourseGroup(sessionId, courseId, groupId, id);
      if (requiredLecturer != null && Number(effectiveLecturer) !== Number(requiredLecturer)) {
        return this.handleResponse(null, { message: 'This course is already scheduled for this class with a different lecturer. All slots for the same course and class must use the same lecturer.' });
      }
    }
    const durationHours = payload.duration_hours ?? (payload.start_time && payload.end_time ? this._hoursBetween(payload.start_time, payload.end_time) : null);
    let semesterIdForHours = payload.semester_id ?? null;
    if (sessionId != null && semesterIdForHours == null) {
      const { data: semList } = await supabase.from('semesters').select('semester_id').eq('session_id', sessionId).eq('status', 'active').limit(1);
      if (semList && semList[0]) semesterIdForHours = semList[0].semester_id;
    }
    if (sessionId != null && courseId != null && groupId != null && durationHours != null) {
      const hoursCheck = await this.checkCourseHoursForGroup(sessionId, courseId, groupId, durationHours, id, semesterIdForHours);
      if (hoursCheck.overLimit) return this.handleResponse(null, { message: hoursCheck.message });
    }
    let day = payload.day;
    let startStr = payload.start_time ? String(payload.start_time).slice(0, 5) : null;
    let endStr = payload.end_time ? String(payload.end_time).slice(0, 5) : null;
    if ((day && startStr && endStr) || existing?.slot_id) {
      if (day && startStr && endStr) {
        const venueCheck = await this.checkVenueConflict(sessionId, effectiveVenue, day, startStr, endStr, id, semesterIdForHours);
        if (venueCheck.conflict) return this.handleResponse(null, { message: venueCheck.message });
        const classCheck = await this.checkClassGroupTimeConflict(sessionId, groupId, day, startStr, endStr, id, courseId);
        if (classCheck.conflict) return this.handleResponse(null, { message: classCheck.message });
        const lecturerCheck = await this.checkLecturerTimeConflict(sessionId, effectiveLecturer, day, startStr, endStr, id);
        if (lecturerCheck.conflict) return this.handleResponse(null, { message: lecturerCheck.message });
        const dayLimitsCheck = await this.checkClassDayLimits(sessionId, groupId, day, startStr, endStr, id, semesterIdForHours);
        if (dayLimitsCheck.conflict) return this.handleResponse(null, { message: dayLimitsCheck.message });
      } else if (existing.slot_id) {
        const { data: slotRow } = await supabase.from('time_slots').select('day_of_week, start_time, end_time').eq('slot_id', existing.slot_id).maybeSingle();
        if (slotRow) {
          day = slotRow.day_of_week;
          startStr = String(slotRow.start_time).slice(0, 5);
          endStr = String(slotRow.end_time).slice(0, 5);
          const venueCheck = await this.checkVenueConflict(sessionId, effectiveVenue, day, startStr, endStr, id, semesterIdForHours);
          if (venueCheck.conflict) return this.handleResponse(null, { message: venueCheck.message });
          const classCheck = await this.checkClassGroupTimeConflict(sessionId, groupId, day, startStr, endStr, id, courseId);
          if (classCheck.conflict) return this.handleResponse(null, { message: classCheck.message });
          const lecturerCheck = await this.checkLecturerTimeConflict(sessionId, effectiveLecturer, day, startStr, endStr, id);
          if (lecturerCheck.conflict) return this.handleResponse(null, { message: lecturerCheck.message });
          const dayLimitsCheck = await this.checkClassDayLimits(sessionId, groupId, day, startStr, endStr, id, semesterIdForHours);
          if (dayLimitsCheck.conflict) return this.handleResponse(null, { message: dayLimitsCheck.message });
        }
      }
      if (groupId && effectiveVenue) {
        const { data: grp } = await supabase.from('class_groups').select('student_count').eq('group_id', groupId).maybeSingle();
        const { data: venueRow } = await supabase.from('venues').select('capacity').eq('venue_id', effectiveVenue).maybeSingle();
        const classSize = grp?.student_count != null ? Number(grp.student_count) : 0;
        const venueCapacity = venueRow?.capacity != null ? Number(venueRow.capacity) : 0;
        if (classSize > 0 && venueCapacity > 0 && classSize > venueCapacity) {
          return this.handleResponse(null, { message: `Venue capacity (${venueCapacity}) is less than class size (${classSize}). Choose a larger venue.` });
        }
      }
    }
    if (payload.slot_id == null && payload.day && payload.start_time && payload.end_time) {
      const slot = await this._getOrCreateTimeSlot(payload.day, payload.start_time, payload.end_time);
      if (slot) payload.slot_id = slot;
      delete payload.day;
      delete payload.start_time;
      delete payload.end_time;
    }
    delete payload.duration_hours;
    const { data: res, error } = await supabase.from('schedules').update(payload).eq('schedule_id', id).select().single();
    if (error) return this.handleResponse(null, error);
    await this._logAudit('schedules', id, 'UPDATE', { course_id: res?.course_id ?? existing?.course_id }, existing ? { course_id: existing.course_id } : null);
    return this.handleResponse(res, null);
  }

  async deleteSchedule(id) {
    const existing = (await this.getScheduleById(id)).data;
    const { data, error } = await supabase.from('schedules').delete().eq('schedule_id', id);
    if (error) return this.handleResponse(null, error);
    await this._logAudit('schedules', id, 'DELETE', null, existing ? { course_id: existing.course_id } : null);
    return this.handleResponse(data, null);
  }

  // =====================================================
  // CONFLICTS
  // =====================================================

  async getConflicts(timetableId) {
    const { data, error } = await supabase.from('conflicts').select('*').eq('timetable_id', timetableId);
    return this.handleResponse(data, error);
  }

  async detectConflicts(timetableData) {
    // Use Edge Function 'validate-schedule' for conflict detection if available
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(timetableData),
      });
      const json = await res.json();
      return json;
    } catch (error) {
      return this.handleResponse(null, error);
    }
  }

  async validateConflicts(timetableData) {
    // Map to same Edge Function or custom validation
    return this.detectConflicts(timetableData);
  }

  async resolveConflict(conflictId, resolution) {
    const { data, error } = await supabase.from('conflicts').update(resolution).eq('conflict_id', conflictId).select().single();
    return this.handleResponse(data, error);
  }

  // =====================================================
  // NON-COMPUTING COURSES
  // =====================================================

  async getNonComputingCourses(params = {}) {
    let q = supabase.from('non_computing_courses').select('*');
    for (const [k, v] of Object.entries(params || {})) {
      if (k === 'limit' || k === 'page') continue;
      q = q.eq(k, v);
    }
    const { data, error } = await q;
    return this.handleResponse(data, error);
  }

  async getNonComputingCourseCategories() {
    const { data, error } = await supabase.from('non_computing_courses').select('category', { count: 'exact' }).limit(1000);
    return this.handleResponse(data, error);
  }

  async createNonComputingCourse(data) {
    const { data: res, error } = await supabase.from('non_computing_courses').insert([data]).select().single();
    return this.handleResponse(res, error);
  }

  async updateNonComputingCourse(id, data) {
    const { data: res, error } = await supabase.from('non_computing_courses').update(data).eq('course_id', id).select().single();
    return this.handleResponse(res, error);
  }

  async deleteNonComputingCourse(id) {
    const { data, error } = await supabase.from('non_computing_courses').delete().eq('course_id', id);
    return this.handleResponse(data, error);
  }

  // =====================================================
  // SPECIAL EVENTS
  // =====================================================

  async getSpecialEvents(params = {}) {
    let q = supabase.from('special_events').select('*');
    for (const [k, v] of Object.entries(params || {})) {
      if (k === 'limit' || k === 'page') continue;
      q = q.eq(k, v);
    }
    if (params?.limit) q = q.limit(params.limit);
    const { data, error } = await q;
    return this.handleResponse(data, error);
  }

  async getSpecialEventById(id) {
    const { data, error } = await supabase.from('special_events').select('*').eq('event_id', id).maybeSingle();
    return this.handleResponse(data, error);
  }

  /** Check if a special event would duplicate an existing one. Break: one per session. Chapel: one level per session (level already set = error even if different day). */
  async _checkDuplicateSpecialEvent(sessionId, eventType, dayOfWeek, startTime, endTime, description, excludeEventId = null) {
    const res = await this.getSpecialEvents({ session_id: sessionId });
    if (!res.success || !Array.isArray(res.data)) return null;
    const isBreak = eventType === 'lunch';
    for (const ev of res.data) {
      if (excludeEventId != null && (ev.event_id === excludeEventId || ev.id === excludeEventId)) continue;
      if (isBreak) {
        if (ev.event_type === 'lunch') return 'A Break event already exists for this session. You cannot add the same special event twice.';
      } else {
        // Chapel Seminar: once a level is set, that level cannot be used again (even on a different day)
        if (ev.event_type === 'lunch') continue;
        const sameLevel = (ev.description || '').trim() === (description || '').trim();
        if (sameLevel) return 'This level has already been set for Chapel Seminar. Each level can only have one Chapel Seminar per session.';
      }
    }
    return null;
  }

  async createSpecialEvent(data) {
    const dup = await this._checkDuplicateSpecialEvent(
      data.session_id,
      data.event_type,
      data.day_of_week,
      data.start_time,
      data.end_time,
      data.description,
      null
    );
    if (dup) return this.handleResponse(null, { message: dup });
    const { data: res, error } = await supabase.from('special_events').insert([data]).select().single();
    return this.handleResponse(res, error);
  }

  async updateSpecialEvent(id, data) {
    const existing = (await this.getSpecialEventById(id)).data;
    const sessionId = data.session_id ?? existing?.session_id;
    const eventType = data.event_type ?? existing?.event_type;
    const dayOfWeek = data.day_of_week ?? existing?.day_of_week;
    const startTime = data.start_time ?? existing?.start_time;
    const endTime = data.end_time ?? existing?.end_time;
    const description = data.description ?? existing?.description;
    const dup = await this._checkDuplicateSpecialEvent(sessionId, eventType, dayOfWeek, startTime, endTime, description, id);
    if (dup) return this.handleResponse(null, { message: dup });
    const { data: res, error } = await supabase.from('special_events').update(data).eq('event_id', id).select().single();
    return this.handleResponse(res, error);
  }

  async deleteSpecialEvent(id) {
    const { data, error } = await supabase.from('special_events').delete().eq('event_id', id);
    return this.handleResponse(data, error);
  }

  /**
   * Check if a proposed schedule slot overlaps a special event (Break or Chapel Seminar).
   * Break applies to all days and levels; Chapel Seminar applies to the given day and level.
   * Returns { success, conflict, message }.
   */
  async checkSpecialEventConflict(sessionId, day, startTime, endTime, classGroupLevel) {
    const res = await this.getSpecialEvents({ session_id: sessionId });
    if (!res.success || !Array.isArray(res.data)) return { success: true, conflict: false };
    const toMinutes = (t) => {
      const s = String(t).slice(0, 5);
      const [h, m] = s.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const start = String(startTime).slice(0, 5);
    const end = String(endTime).slice(0, 5);
    const s1 = toMinutes(start);
    const e1 = toMinutes(end);
    const levelFromDescription = (desc) => {
      if (!desc) return null;
      const m = String(desc).match(/Level\s*(\d+)/i);
      return m ? parseInt(m[1], 10) : null;
    };
    for (const ev of res.data) {
      const evStart = toMinutes(ev.start_time);
      const evEnd = toMinutes(ev.end_time);
      if (s1 >= evEnd || e1 <= evStart) continue;
      const dayMatch = ev.day_of_week === 'All' || ev.day_of_week === day;
      if (!dayMatch) continue;
      const isBreak = ev.event_type === 'lunch';
      if (isBreak) {
        return {
          success: true,
          conflict: true,
          message: `This time overlaps with the special event "${ev.event_name || 'Break'}" (all days ${String(ev.start_time).slice(0, 5)}–${String(ev.end_time).slice(0, 5)}). No lectures can be scheduled during this time.`,
        };
      }
      const evLevel = levelFromDescription(ev.description);
      const levelMatch = evLevel == null || evLevel === Number(classGroupLevel);
      if (levelMatch) {
        return {
          success: true,
          conflict: true,
          message: `This time overlaps with Chapel Seminar for ${evLevel != null ? evLevel : 'this level'} on ${ev.day_of_week} (${String(ev.start_time).slice(0, 5)}–${String(ev.end_time).slice(0, 5)}). No lectures can be scheduled then.`,
        };
      }
    }
    return { success: true, conflict: false };
  }

  // =====================================================
  // TIMETABLE & SCHEDULING
  // =====================================================

  async getTimetables(params = {}) {
    let q = supabase.from('timetables').select('*');
    for (const [k, v] of Object.entries(params || {})) {
      if (k === 'limit' || k === 'page') continue;
      q = q.eq(k, v);
    }
    if (params?.limit) q = q.limit(params.limit);
    const { data, error } = await q;
    return this.handleResponse(data, error);
  }

  async getTimetableById(id) {
    const { data, error } = await supabase.from('timetables').select('*').eq('timetable_id', id).maybeSingle();
    return this.handleResponse(data, error);
  }

  async createTimetable(data) {
    const { data: res, error } = await supabase.from('timetables').insert([data]).select().single();
    return this.handleResponse(res, error);
  }

  async updateTimetable(id, data) {
    const { data: res, error } = await supabase.from('timetables').update(data).eq('timetable_id', id).select().single();
    return this.handleResponse(res, error);
  }

  async getSchedulesByTimetable(timetableId) {
    const { data, error } = await supabase.from('schedules').select('*').eq('timetable_id', timetableId);
    return this.handleResponse(data, error);
  }

  // Public/search endpoints
  async getPublicDepartments() {
    const { data, error } = await supabase.from('departments').select('*').eq('status', 'active');
    return this.handleResponse(data, error);
  }

  async getClassGroupsByDepartmentAndLevel(department, level) {
    const { data, error } = await supabase.from('class_groups').select('*').eq('department', department).eq('level', level);
    return this.handleResponse(data, error);
  }

  async getLevelsByDepartment(department) {
    const { data, error } = await supabase.from('class_groups')
      .select('level', { count: 'exact' })
      .eq('department', department)
      .eq('status', 'active');

    if (error) return this.handleResponse(null, error);

    // Extract unique levels
    const uniqueLevels = [...new Set((data || []).map(d => d.level))].sort();
    return this.handleResponse(uniqueLevels, null);
  }

  async getPublicTimetable(classGroupId, sessionId) {
    if (!classGroupId || !sessionId) return this.handleResponse(null, { message: 'classGroupId and sessionId required' });
    // Only show timetable when a semester for this session has been published
    const semRes = await this.getSemestersBySession(sessionId);
    const semesters = (semRes.success && Array.isArray(semRes.data)) ? semRes.data : [];
    const hasPublished = semesters.some((s) => s.timetable_status === 'published');
    if (!hasPublished) {
      return { success: true, data: [], published: false };
    }
    const scheduleRes = await this.getSchedulesWithDetails({ session_id: sessionId, group_id: classGroupId });
    if (!scheduleRes.success) return scheduleRes;
    const list = Array.isArray(scheduleRes.data) ? scheduleRes.data : [];
    // Include non-computing (GEDS/SAT) courses that have assignment for this class
    const { data: ncCourses } = await supabase
      .from('courses')
      .select('course_id, course_code, title, assignment')
      .in('category', ['GEDS', 'SAT'])
      .eq('session_id', sessionId);
    const forGroup = (ncCourses || []).filter((c) => {
      const a = typeof c.assignment === 'string' ? (() => { try { return JSON.parse(c.assignment); } catch (_) { return {}; } })() : (c.assignment || {});
      const gid = a.class_group_id != null ? Number(a.class_group_id) : null;
      return gid === Number(classGroupId);
    });
    const formatTime = (t) => (t ? String(t).slice(0, 5) : '');
    const merged = list.slice();
    for (const c of forGroup) {
      const a = typeof c.assignment === 'string' ? (() => { try { return JSON.parse(c.assignment); } catch (_) { return {}; } })() : (c.assignment || {});
      if (!a.day_of_week || !a.start_time || !a.end_time) continue;
      merged.push({
        id: 'nc-' + (c.course_id || 0),
        schedule_id: null,
        course_id: c.course_id,
        lecturer_id: a.lecturer_id || null,
        venue_id: null,
        class_group_id: classGroupId,
        day: a.day_of_week,
        day_of_week: a.day_of_week,
        start_time: formatTime(a.start_time),
        end_time: formatTime(a.end_time),
        lecturer_name: a.lecturer_name || '—',
        course_code: c.course_code || '—',
        course_title: c.title,
        course_name: c.title || c.course_code || '—',
        class_name: '—',
        group_name: '—',
        venue_name: '—',
        session_id: sessionId,
        status: 'scheduled',
      });
    }
    return this.handleResponse(merged, null);
  }

  /**
   * Get all published timetable entries for a department (all levels and groups).
   * Used for landing page "View department timetable" and "View level timetable" (filter by level on client).
   */
  async getPublicTimetableByDepartment(sessionId, departmentName) {
    if (!sessionId || !departmentName) return this.handleResponse(null, { message: 'sessionId and departmentName required' });
    const semRes = await this.getSemestersBySession(sessionId);
    const semesters = (semRes.success && Array.isArray(semRes.data)) ? semRes.data : [];
    const hasPublished = semesters.some((s) => s.timetable_status === 'published');
    if (!hasPublished) {
      return { success: true, data: [], published: false };
    }
    const scheduleRes = await this.getSchedulesWithDetails({ session_id: sessionId, department: departmentName });
    if (!scheduleRes.success) return scheduleRes;
    const list = Array.isArray(scheduleRes.data) ? scheduleRes.data : [];
    return this.handleResponse(list, null);
  }
}

export default new ApiService();