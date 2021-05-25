INSERT INTO department (name)
VALUES ('Management'),
  ('Sales'),
  ('Tech'),
  ('Human Resources'),
  ('Accounting'),
  ('Party Planning');
INSERT INTO role (title, salary, department_id)
VALUES ('Manager', 200000, 1),
  ('Sales Associate', 65000, 2),
  ('Software Engineer', 100000, 3),
  ('Adminstrative Associate', 70000, 4),
  ('Accountant', 90000, 5);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Nick', 'Carter', 1, NULL),
  ('Captain', 'America', 2, 1),
  ('Black', 'Widow', 2, 2),
  ('Thor', 'Odinson', 3, 1),
  ('The', 'Hulk', 3, 4),
  ('Iron', 'Man', 4, 1),
  ('Mr.', 'Hawkeye', 4, 6),
  ('Scarlet', 'Witch', 5, 1),
  ('Mr.', 'Vision', 5, 8);