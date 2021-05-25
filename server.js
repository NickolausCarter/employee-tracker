const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const table = require('console.table');

// Create database connection
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'SMokey11',
  database: 'employee_db'
});

// connection.connect(err => {
//   if (err) throw err;
//   console.log("Connected as ID" + connection.threadId)
// });

function promptUser() {
  return inquirer.prompt([
    {
      name: 'menu',
      type: 'list',
      message: 'Select an option:',
      choices: [
        'View all Employees',
        'View all Roles',
        'View all Departments',
        'Add Employee',
        'Update Employee Role',
        'Add Role',
        'Add Department',
        'Quit'
      ],
      loop: false
    }
  ])
  .then(response => {
    if (response.menu === 'View all Employees') {
      allEmployees();
    }
    
    if (response.menu === 'Add Employee') {
      addEmployee();
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

    if (response.menu === 'View all Departments') {
      viewDept();
    }

    if (response.menu === 'Add Department') {
      addDept();
    }

    if (response.menu === 'Quit') {
      connection.end();
    }
  }) 
};

async function allEmployees() {
  // Query to view employees
  var query = `SELECT e.id, e.first_name, e.last_name, role.title AS Title, department.name AS Department, role.salary AS Salary, CONCAT(m.first_name,' ', m.last_name) AS Manager 
    FROM employee e 
    LEFT JOIN employee m ON e.manager_id = m.id 
    LEFT JOIN role ON e.role_id=role.id 
    LEFT JOIN department ON role.department_id=department.id`;
  const [rows, fields] = await connection.query(query);
  
  console.table(rows);
  
  promptUser();
};

async function addEmployee() {
  var arrChoices = await getRolesList();
  var arrManager = await getManagerList();
  return inquirer
    .prompt([
      {
        name: "first_name",
        type: "input",
        message: "Enter new employee's first name:",
      },
      {
        name: "last_name",
        type: "input",
        message: "Enter new employee's last name:",
      },
      {
        name: "role",
        type: "list",
        message: "Select new employee's role:",
        choices: arrChoices,
      },
      {
        name: "manager",
        type: "list",
        message: "Assign a manager to new employee:",
        choices: arrManager,
      },
    ])
    .then(async function (res) {
      // First get the id of the manager
      var query = `SELECT id FROM employee WHERE first_name='${res.manager}'`;
      const [rows, fields] = await connection.query(query);
      query = `INSERT INTO employee (first_name,last_name,role_id,manager_id) 
            values ('${res.first_name}','${res.last_name}',              
            (SELECT id FROM role WHERE title='${res.role}'), '${rows[0].id}')`;
      const [rows2, fields2] = await connection.query(query);
      console.log('New employee has been added!');

      promptUser();
    });
};

async function updateRole() {
  var arrChoices = await getRolesList();
  return inquirer
    .prompt([
      {
        name: "first_name",
        type: "input",
        message: "Enter the employees first name:",
      },
      {
        name: "last_name",
        type: "input",
        message: "Enter the employees last name:",
      },
      {
        name: "role",
        type: "list",
        message: "Select a role for this employee:",
        choices: arrChoices,
      },
    ])
    .then(async function (res) {
      var glbEmpId = 0;
      // >>>> Query 1: Get the employee ID
      var query = `SELECT id FROM employee WHERE first_name='${res.first_name}'
                AND last_name='${res.last_name}'`;
      const [rows, fields] = await connection.query(query);
      glbEmpId = rows[0].id;
      // >>>> Query 2: Get the role ID
      query = `SELECT id FROM role WHERE title = '${res.role}'`;
      const [rows2, fields2] = await connection.query(query);
      // >>>> Query 3: Update the employee record
      query = `UPDATE employee SET role_id = ${rows2[0].id} WHERE id=${glbEmpId}`;
      const [rows3, fields3] = await connection.query(query);
      console.log("Employee role has been updated!");
      promptUser();
    })
};

async function viewRoles() {
   // Use query to bring the list of all departments
   const [rows, fields] = await connection.query(
    `SELECT role.title, role.id AS role_id, department.name AS Department, role.salary 
     FROM role INNER JOIN department ON role.department_id = department.id ORDER BY role_id`
  );
  console.table(rows);
  promptUser();
};

async function addRole() {
  var arrChoices = await getDepartmentsList();
  return inquirer
    .prompt([
      {
        name: "title",
        type: "input",
        message: "Enter the title for this new role:",
      },
      {
        name: "salary",
        type: "input",
        message: "Enter the salary for this role:",
      },
      {
        name: "department",
        type: "list",
        message: "Select the department this role belongs to:",
        choices: arrChoices,
      },
    ])
    .then(async function (res) {
      var query = `INSERT INTO role (title, salary, department_id)
              VALUE ('${res.title}' , ${res.salary},
             (SELECT id FROM department WHERE name='${res.department}'))`;
      const [rows, fields] = await connection.query(query);
      console.log("The new role has been added!");
      promptUser();
    });
}

async function viewDept() {
  // Display list of all departments
  const [rows, fields] = await connection.execute("SELECT * FROM department");
  console.table(rows);
  promptUser();
}

async function addDept() {
  return inquirer
    .prompt([
      {
        name: "name",
        type: "input",
        message: "Enter the name of the new department:",
      },
    ])
    .then(async function (res) {
      var query = `INSERT INTO department (name) VALUE ('${res.name}');`;
      const [rows, fields] = await connection.query(query);
      console.log("The new department has been added!");
      promptUser();
    });
};

async function getDepartmentsList() {
  var arrResults = [];
  var query = `SELECT name FROM department`;
  const [rows, fields] = await connection.query(query);
  for (var i = 0; i < rows.length; i++) {
    arrResults.push(rows[i].name);
  }
  return arrResults;
};

async function getRolesList() {
  var arrResults = [];
  var query = `SELECT title FROM role`;
  const [rows, fields] = await connection.query(query);
  for (var i = 0; i < rows.length; i++) {
    arrResults.push(rows[i].title);
  }
  return arrResults;
};

async function getManagerList() {
  var arrResults = [];
  var query = `SELECT first_name FROM employee`;
  const [rows, fields] = await connection.query(query);
  for (var i = 0; i < rows.length; i++) {
    arrResults.push(rows[i].first_name);
  }
  return arrResults;
};

promptUser();