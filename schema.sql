CREATE DATABASE IF NOT EXISTS placement_db;
USE placement_db;

CREATE TABLE IF NOT EXISTS students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    cgpa DECIMAL(3,2),
    graduation_year INT,
    skills VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS placements (
    placement_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    company_name VARCHAR(100),
    package_lpa DECIMAL(5,2),
    placement_date DATE,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

INSERT INTO students (name, department, cgpa, graduation_year, skills) VALUES
('Rahul', 'CSE', 8.50, 2027, 'Python, Java'),
('Priya', 'IT', 9.00, 2027, 'Python, SQL'),
('Arun', 'ECE', 7.80, 2027, 'C, Java'),
('Sneha', 'CSE', 8.90, 2027, 'Java, SQL'),
('Kiran', 'IT', 7.50, 2027, 'Python, HTML'),
('Divya', 'CSE', 9.20, 2027, 'Python, ML'),
('Manoj', 'ECE', 7.90, 2027, 'C, Python'),
('Pooja', 'IT', 8.60, 2027, 'Java, SQL'),
('Sai', 'CSE', 7.70, 2027, 'HTML, CSS'),
('Anjali', 'IT', 8.80, 2027, 'Python, Java');

INSERT INTO placements (student_id, company_name, package_lpa, placement_date) VALUES
(1, 'TCS', 6.00, '2026-08-01'),
(2, 'Infosys', 7.00, '2026-08-05'),
(3, 'Wipro', 5.00, '2026-08-10'),
(4, 'Amazon', 12.00, '2026-08-15'),
(6, 'Google', 18.00, '2026-08-20'),
(7, 'TCS', 5.50, '2026-08-25'),
(8, 'Infosys', 6.50, '2026-08-28'),
(10, 'Accenture', 7.00, '2026-08-30');
