// Simple script to debug export data
const { db } = require('./db');
const { user, classes, userClassAssignments, academicTerms } = require('./db/schema/jejak');
const { eq, and, inArray } = require('drizzle-orm');

async function debugExport() {
  try {
    console.log('=== DEBUG EXPORT ===');

    // 1. Check total students
    const allStudents = await db
      .select({ count: '*' })
      .from(user)
      .where(eq(user.role, 'STUDENT'));
    console.log('Total students:', allStudents[0]?.count);

    // 2. Check students with class assignments
    const studentsWithClasses = await db
      .select({ count: '*' })
      .from(user)
      .leftJoin(userClassAssignments, eq(user.id, userClassAssignments.userId))
      .where(eq(user.role, 'STUDENT'))
      .where(userClassAssignments.classId.isNotNull());
    console.log('Students with class assignments:', studentsWithClasses[0]?.count);

    // 3. Check classes
    const allClasses = await db
      .select({
        id: classes.id,
        name: classes.name,
        studentCount: db
          .select({ count: '*' })
          .from(userClassAssignments)
          .where(eq(userClassAssignments.classId, classes.id))
          .as('count')
      })
      .from(classes);
    console.log('Classes with student counts:', allClasses);

    // 4. Check sample student data
    const sampleStudents = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        className: classes.name,
      })
      .from(user)
      .leftJoin(userClassAssignments, eq(user.id, userClassAssignments.userId))
      .leftJoin(classes, eq(userClassAssignments.classId, classes.id))
      .where(eq(user.role, 'STUDENT'))
      .limit(5);
    console.log('Sample students:', sampleStudents);

  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugExport();