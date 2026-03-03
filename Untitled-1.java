import java.awt.BorderLayout;
import java.awt.Font;
import java.awt.GridLayout;
import java.awt.event.ActionEvent;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;
import javax.swing.table.DefaultTableModel;

public class CGPACalculatorGUNew extends JFrame {

    private JTextField creditField, scoreField;
    private JLabel cgpaLabel;
    private DefaultTableModel tableModel;

    private double totalQualityPoints = 0;
    private int totalCreditUnits = 0;

    public CGPACalculatorGUI() {

        setTitle("CGPA Calculator");
        setSize(600, 500);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        // Main Panel
        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBorder(BorderFactory.createEmptyBorder(15, 15, 15, 15));

        // Top Panel (Input Section)
        JPanel inputPanel = new JPanel(new GridLayout(3, 2, 10, 10));

        inputPanel.add(new JLabel("Credit Unit:"));
        creditField = new JTextField();
        inputPanel.add(creditField);

        inputPanel.add(new JLabel("Score (0-100):"));
        scoreField = new JTextField();
        inputPanel.add(scoreField);

        JButton addButton = new JButton("Add Course");
        JButton resetButton = new JButton("Reset");

        inputPanel.add(addButton);
        inputPanel.add(resetButton);

        panel.add(inputPanel, BorderLayout.NORTH);

        // Table
        String[] columns = { "Credit Unit", "Score", "Grade Point", "Quality Point" };
        tableModel = new DefaultTableModel(columns, 0);
        JTable table = new JTable(tableModel);
        JScrollPane scrollPane = new JScrollPane(table);

        panel.add(scrollPane, BorderLayout.CENTER);

        // Bottom Panel (Result Section)
        JPanel bottomPanel = new JPanel(new BorderLayout());

        JButton calculateButton = new JButton("Calculate CGPA");
        cgpaLabel = new JLabel("CGPA: 0.00", SwingConstants.CENTER);
        cgpaLabel.setFont(new Font("Arial", Font.BOLD, 18));

        bottomPanel.add(calculateButton, BorderLayout.NORTH);
        bottomPanel.add(cgpaLabel, BorderLayout.CENTER);

        panel.add(bottomPanel, BorderLayout.SOUTH);

        // Button Actions
        addButton.addActionListener(this::addCourse);
        calculateButton.addActionListener(this::calculateCGPA);
        resetButton.addActionListener(e -> resetAll());

        add(panel);
        setVisible(true);
    }

    private void addCourse(ActionEvent e) {
        try {
            int credit = Integer.parseInt(creditField.getText());
            int score = Integer.parseInt(scoreField.getText());

            if (score < 0 || score > 100) {
                JOptionPane.showMessageDialog(this, "Score must be between 0 and 100");
                return;
            }

            double gradePoint = getGradePoint(score);
            double qualityPoint = credit * gradePoint;

            totalCreditUnits += credit;
            totalQualityPoints += qualityPoint;

            tableModel.addRow(new Object[] {
                    credit,
                    score,
                    gradePoint,
                    qualityPoint
            });

            creditField.setText("");
            scoreField.setText("");

        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Enter valid numeric values!");
        }
    }

    private void calculateCGPA(ActionEvent e) {

        if (totalCreditUnits == 0) {
            JOptionPane.showMessageDialog(this, "No courses added!");
            return;
        }

        double cgpa = totalQualityPoints / totalCreditUnits;
        cgpaLabel.setText("CGPA: " + String.format("%.2f", cgpa));
    }

    private void resetAll() {
        totalCreditUnits = 0;
        totalQualityPoints = 0;
        tableModel.setRowCount(0);
        cgpaLabel.setText("CGPA: 0.00");
    }

    private double getGradePoint(int score) {

        if (score >= 80)
            return 5.0;
        else if (score >= 60)
            return 4.0;
        else if (score >= 50)
            return 3.0;
        else if (score >= 45)
            return 2.0;
        else if (score >= 40)
            return 1.0;
        else
            return 0.0;
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(CGPACalculatorGUINew::new);
    }
}