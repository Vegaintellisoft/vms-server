const db = require('../db').promise;
const bcrypt = require('bcrypt');

async function runSeed() {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     VMS Database Seeding Started         ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  try {
    // ──────────────────────────────────────────
    // STEP 1: Disable FK checks & clean tables
    // ──────────────────────────────────────────
    await db.query('SET FOREIGN_KEY_CHECKS = 0;');
    console.log('✓ Foreign key checks disabled');

    const tablesToTruncate = [
      'refresh_tokens',
      'role_permissions',
      'appointment_scheduling',
      'otp_verifications',
      'otp_verification',
      'otps',
      'visitors',
      'temp_visitors',
      'employees',
      'designations',
      'departments',
      'companies',
      'permissions',
      'modules',
      'roles',
      'purpose',
    ];

    for (const table of tablesToTruncate) {
      try {
        await db.query(`TRUNCATE TABLE \`${table}\`;`);
      } catch (e) {
        // Table might not exist in fresh DB — skip silently
        console.log(`  ⚠ Table '${table}' not found, skipping...`);
      }
    }
    console.log('✓ All tables truncated');
    console.log('');

    // ──────────────────────────────────────────
    // STEP 2: Seed Modules
    // ──────────────────────────────────────────
    const modulesData = [
      ['Dashboard', 'Main dashboard and analytics views'],           // 1
      ['Visitor Management', 'Check-in, check-out, and visitor tracking'], // 2
      ['Appointment Management', 'Appointment scheduling and management'], // 3
      ['Employee Management', 'Employee records and management'],     // 4
      ['Masters', 'Company, Department, Designation management'],     // 5
      ['Role Management', 'User roles and permissions management'],   // 6
      ['Reports', 'Report generation and exports'],                   // 7
    ];
    await db.query('INSERT INTO modules (module_name, module_description) VALUES ?', [modulesData]);
    console.log('✓ Inserted 7 modules');

    // ──────────────────────────────────────────
    // STEP 3: Seed Permissions
    // ──────────────────────────────────────────
    const permissionsData = [
      // Dashboard (module_id = 1)
      ['View Dashboard', 'Access to view the main dashboard', 1],          // 1
      ['View Analytics', 'Access to view analytics and charts', 1],        // 2
      // Visitor Management (module_id = 2)
      ['View Visitors', 'View visitor list', 2],                           // 3
      ['Create Visitor', 'Check-in new visitors', 2],                      // 4
      ['Edit Visitor', 'Modify visitor information', 2],                   // 5
      ['Delete Visitor', 'Remove visitor records', 2],                     // 6
      ['Check-out Visitor', 'Check-out visitors', 2],                      // 7
      // Appointment Management (module_id = 3)
      ['View Appointments', 'View appointment list', 3],                   // 8
      ['Create Appointment', 'Schedule new appointments', 3],              // 9
      ['Edit Appointment', 'Modify appointments', 3],                      // 10
      ['Delete Appointment', 'Cancel appointments', 3],                    // 11
      // Employee Management (module_id = 4)
      ['View Employees', 'View employee list', 4],                         // 12
      ['Create Employee', 'Add new employees', 4],                         // 13
      ['Edit Employee', 'Modify employee details', 4],                     // 14
      ['Delete Employee', 'Remove employee records', 4],                   // 15
      // Masters (module_id = 5)
      ['View Masters', 'View company, department, designation', 5],        // 16
      ['Create Masters', 'Add new master records', 5],                     // 17
      ['Edit Masters', 'Modify master records', 5],                        // 18
      ['Delete Masters', 'Remove master records', 5],                      // 19
      // Role Management (module_id = 6)
      ['View Roles', 'View role list', 6],                                 // 20
      ['Create Role', 'Create new roles', 6],                              // 21
      ['Edit Role', 'Modify role permissions', 6],                         // 22
      ['Delete Role', 'Remove roles', 6],                                  // 23
      // Reports (module_id = 7)
      ['View Reports', 'Access to view reports', 7],                       // 24
      ['Export Reports', 'Export reports to PDF/Excel', 7],                 // 25
    ];
    await db.query('INSERT INTO permissions (permission_name, permission_description, designated_module_id) VALUES ?', [permissionsData]);
    console.log('✓ Inserted 25 permissions');

    // ──────────────────────────────────────────
    // STEP 4: Seed Roles
    // ──────────────────────────────────────────
    const rolesData = [
      ['Building Admin', 'Active', 1],   // role_id = 1  (Super Admin - manages entire building)
      ['Company Admin', 'Active', 1],     // role_id = 2  (Admin of one company)
      ['Receptionist', 'Active', 1],      // role_id = 3  (Front desk)
      ['Security', 'Active', 1],          // role_id = 4  (Gate security)
      ['Employee', 'Active', 1],          // role_id = 5  (Regular employee - view only)
    ];
    await db.query('INSERT INTO roles (role_name, status, visibility) VALUES ?', [rolesData]);
    console.log('✓ Inserted 5 roles');

    // ──────────────────────────────────────────
    // STEP 5: Assign Permissions to Roles
    // ──────────────────────────────────────────
    const rolePermissions = {
      // Building Admin → ALL permissions
      1: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25],
      // Company Admin → All except Delete Employee and Role Management Delete
      2: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,24,25],
      // Receptionist → Dashboard, Visitors, Appointments (View + Create + Check-out)
      3: [1,3,4,5,7,8,9],
      // Security → Dashboard, View Visitors, Check-out
      4: [1,3,7],
      // Employee → Dashboard, View Visitors, View Appointments
      5: [1,3,8],
    };

    const rpData = [];
    for (const [roleId, permIds] of Object.entries(rolePermissions)) {
      for (const permId of permIds) {
        rpData.push([parseInt(roleId), permId]);
      }
    }
    await db.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ?', [rpData]);
    console.log('✓ Assigned permissions to all roles');

    // ──────────────────────────────────────────
    // STEP 6: Seed Visit Purposes
    // ──────────────────────────────────────────
    const purposesData = [
      ['Consultation'],         // 1
      ['Demo'],                 // 2
      ['Support'],              // 3
      ['Business Meet'],        // 4
      ['Interview Candidate'],  // 5
      ['Vendor'],               // 6
      ['Government Official'],  // 7
      ['Other'],                // 8
    ];
    await db.query('INSERT INTO purpose (purpose) VALUES ?', [purposesData]);
    console.log('✓ Inserted 8 visit purposes');

    // ──────────────────────────────────────────
    // STEP 7: Seed Companies
    // ──────────────────────────────────────────
    const companiesData = [
      ['VEGAINTELLISOFT', 'Active'],  // company_id = 1
      ['SOZO', 'Active'],             // company_id = 2
    ];
    await db.query('INSERT INTO companies (company_name, status) VALUES ?', [companiesData]);
    console.log('✓ Inserted 2 companies');

    // ──────────────────────────────────────────
    // STEP 8: Seed Departments
    // ──────────────────────────────────────────
    const departmentsData = [
      [1, 'Management', 'Active'],     // dept_id = 1 (VEGAINTELLISOFT)
      [1, 'Engineering', 'Active'],    // dept_id = 2
      [1, 'Human Resources', 'Active'],// dept_id = 3
      [2, 'Development', 'Active'],    // dept_id = 4 (SOZO)
      [2, 'Marketing', 'Active'],      // dept_id = 5
    ];
    await db.query('INSERT INTO departments (company_id, dept_name, status) VALUES ?', [departmentsData]);
    console.log('✓ Inserted 5 departments');

    // ──────────────────────────────────────────
    // STEP 9: Seed Designations
    // ──────────────────────────────────────────
    const designationsData = [
      [1, 1, 'Director', 'Active'],              // desig_id = 1
      [1, 1, 'PMO', 'Active'],                   // desig_id = 2
      [1, 2, 'Software Engineer', 'Active'],     // desig_id = 3
      [1, 2, 'Senior Software Engineer', 'Active'], // desig_id = 4
      [1, 3, 'HR Manager', 'Active'],            // desig_id = 5
      [2, 4, 'Developer', 'Active'],             // desig_id = 6
      [2, 5, 'Marketing Manager', 'Active'],     // desig_id = 7
    ];
    await db.query('INSERT INTO designations (company_id, department_id, desgnation_name, status) VALUES ?', [designationsData]);
    console.log('✓ Inserted 7 designations');

    // ──────────────────────────────────────────
    // STEP 10: Create Default Employee Accounts
    // ──────────────────────────────────────────
    const defaultPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const defaultAccounts = [
      {
        first_name: 'System', last_name: 'Admin',
        email: 'admin@vegaintellisoft.com', phone: '0000000000',
        gender: 'Male',
        company_id: 1, department_id: 1, designation_id: 1,
        role_id: 1, status: 'Active',
        password: hashedPassword,
        remarks: 'Building Admin — Full access'
      },
      {
        first_name: 'Company', last_name: 'Admin',
        email: 'companyadmin@vegaintellisoft.com', phone: '1111111111',
        gender: 'Male',
        company_id: 1, department_id: 1, designation_id: 2,
        role_id: 2, status: 'Active',
        password: hashedPassword,
        remarks: 'Company Admin — Manages one company'
      },
      {
        first_name: 'Front', last_name: 'Desk',
        email: 'receptionist@vegaintellisoft.com', phone: '2222222222',
        gender: 'Female',
        company_id: 1, department_id: 1, designation_id: 2,
        role_id: 3, status: 'Active',
        password: hashedPassword,
        remarks: 'Receptionist — Visitor check-in/out'
      },
      {
        first_name: 'Campus', last_name: 'Security',
        email: 'security@vegaintellisoft.com', phone: '3333333333',
        gender: 'Male',
        company_id: 1, department_id: 1, designation_id: 2,
        role_id: 4, status: 'Active',
        password: hashedPassword,
        remarks: 'Security — QR scan and gate access'
      },
      {
        first_name: 'Staff', last_name: 'Member',
        email: 'employee@vegaintellisoft.com', phone: '4444444444',
        gender: 'Male',
        company_id: 1, department_id: 2, designation_id: 3,
        role_id: 5, status: 'Active',
        password: hashedPassword,
        remarks: 'Employee — View-only access'
      },
      {
        first_name: 'Rajesh', last_name: 'S',
        email: 'rajesh@vegaintellisoft.com', phone: '9585847721',
        gender: 'Male',
        company_id: 1, department_id: 2, designation_id: 4,
        role_id: 2, status: 'Active',
        password: hashedPassword,
        remarks: 'Sample employee'
      },
    ];

    for (const acc of defaultAccounts) {
      await db.query('INSERT INTO employees SET ?', acc);
    }

    console.log('✓ Created 6 default employee accounts');

    // ──────────────────────────────────────────
    // RE-ENABLE & FINISH
    // ──────────────────────────────────────────
    await db.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✓ Foreign key checks re-enabled');

    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║   ✅ Database Seeding Complete!          ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
    console.log('Default Login Accounts (password: admin123):');
    console.log('┌────────────────────────────────────────────────────────┐');
    console.log('│ Role              │ Email                             │');
    console.log('├────────────────────────────────────────────────────────┤');
    console.log('│ Building Admin    │ admin@vegaintellisoft.com          │');
    console.log('│ Company Admin     │ companyadmin@vegaintellisoft.com   │');
    console.log('│ Receptionist      │ receptionist@vegaintellisoft.com   │');
    console.log('│ Security          │ security@vegaintellisoft.com       │');
    console.log('│ Employee          │ employee@vegaintellisoft.com       │');
    console.log('└────────────────────────────────────────────────────────┘');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Seeding error:', error.message);
    console.error(error);
  } finally {
    process.exit();
  }
}

runSeed();
