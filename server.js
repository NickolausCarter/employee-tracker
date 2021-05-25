const inquirer = require('inquirer');
const mysql = require('mysql2');
const table = require('console.table');
const menuOptions = ['View all Employees', 'View all Employees by Department', 'View all Employees by Manager', 'Add Employee', 'Remove Employee', 'Update Employee Role', 'View all Roles', 'Add Role', 'Remove Role', 'View all Departments', 'Add Department', 'Remove Department', 'Quit'];
const allEmployeeQuery = 
    `SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title, d.department_name AS "Department", IFNULL(r.salary, 'No Data') AS "Salary", CONCAT(m.first_name," ",m.last_name) AS "Manager"
    FROM employees e
    LEFT JOIN roles r 
    ON r.id = e.role_id 
    LEFT JOIN departments d 
    ON d.id = r.department_id
    LEFT JOIN employees m ON m.id = e.manager_id
    ORDER BY e.id;`

const addEmployeeQuestions = ['What is the first name?', 'What is the last name?', 'What is their role?', 'Who is their manager?']
const roleQuery = 'SELECT * from roles; SELECT CONCAT (e.first_name," ",e.last_name) AS full_name FROM employees e'
const mgrQuery = 'SELECT CONCAT (e.first_name," ",e.last_name) AS full_name, r.title, d.department_name FROM employees e INNER JOIN roles r ON r.id = e.role_id INNER JOIN departments d ON d.id = r.department_id WHERE department_name = "Management";'

// Create database connection
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SMokey11',
  database: 'employee_db'
});

connection.connect(err => {
  if (err) throw err;
  console.log("Connected as ID" + connection.threadId)
});

const promptUser = () => {
  return inquirer.prompt(
    [
      {
        type: 'list',
        name: 'menu',
        message: 'Select an option:',
        choices: menuOptions
      }
    ]
  )
  .then(response => {
    if (response.menu === 'View all Employees') {
      allEmployees();
    }

    if (response.menu === 'View all Employees by Department') {
      showByDept();
    }
    
    if (response.menu === 'View all Employees by Manager') {
      showByManager();
    }
    
    if (response.menu === 'Add Employee') {
      addEmployee();
    }
    
    if (response.menu === 'Remove Employee') {
      removeEmployee();
    }

    if (response.menu === 'Update Employee Role') {
      updateRole();
    }

    if (response.menu === 'View all Roles') {
      viewRoles();
    }

    if (response.menu === 'Add Role') {
      addRole();
    }

    if (response.menu === 'Remove Role') {
      removeRole();
    }

    if (response.menu === 'View all Departments') {
      viewDept();
    }

    if (response.menu === 'Add Department') {
      addDept();
    }

    if (response.menu === 'Remove Department') {
      removeDept();
    }

    if (response.menu === 'Quit') {
      connection.end();
    }
  }) 
};

const allEmployees = () => {
  connection.query(allEmployeeQuery, (err, results) => {
    if (err) throw err;
    console.log('=========');
    console.table('All Employees', results)
    promptUser();
  })
};

const showByDept = () => {
  const deptQuery = 'SELECT * FROM departments';
  connection.query(deptQuery, (err, results) => {
    if (err) throw err;

    inquirer.prompt([
      {
        name: 'deptChoice',
        type: 'list',
        choices: function () {
          let choiceArray = results.map(choice => choice.department_name);
          return choiceArray;
        },
        message: 'Select a department to view:'
      }
    ]).then(response => {
      let selectedDept;
      for (let i = 0; i < results.length; i++) {
        if (results[i].department_name === response.deptChoice) {
          selectedDept = results[i];
        }
      }

      const query = 'SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title AS "Title", d.department_name AS "Department", r.salary AS "Salary" FROM employees e INNER JOIN roles r ON r.id = e.role_id INNER JOIN departments d ON d.id = r.department_id WHERE ?;';
      conneciton.query(query, { department_name: selectedDept.department_name }, (err, res) => {
        if (err) throw err;
        console.log('=========');
        console.table(`All Employees by Department: ${selectedDept.department_name}`, res);
        promptUser();
      });
    });
  });
};

promptUser();