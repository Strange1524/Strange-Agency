import * as dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import 'express-async-errors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import { db } from './src/db/index';
import { users, students, subjects, results, gallery, passwordResetRequests, classes, siteSettings, siteVisits, assignments } from './src/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import multer from 'multer';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-city-academy';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads', 'gallery');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  const upload = multer({ storage });

  // Seed Admin User
  try {
    const oldAdminExists = (await db.select().from(users).where(eq(users.username, 'admin')).limit(1))[0];
    if (oldAdminExists) {
      await db.update(users).set({ username: 'Admin' }).where(eq(users.username, 'admin'));
    }

    const adminExists = (await db.select().from(users).where(eq(users.username, 'Admin')).limit(1))[0];
    const defaultAdminPassword = '@@Come2e@rth##';
    const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);
    
    if (!adminExists) {
      await db.insert(users).values({
        username: 'Admin',
        password: hashedPassword,
        role: 'admin',
        name: 'System Administrator'
      });
    } else {
      // Force reset the password to ensure it matches the required details
      await db.update(users).set({ password: hashedPassword }).where(eq(users.username, 'Admin'));
    }

    // Seed Site Settings
    const settingsExist = (await db.select().from(siteSettings).limit(1))[0];
    if (!settingsExist) {
      await db.insert(siteSettings).values({
        mission: 'To provide a nurturing and innovative learning environment that empowers students to achieve academic excellence and personal growth.',
        vision: 'To be a leading educational institution recognized for fostering critical thinking, creativity, and global citizenship.',
        about: 'City Academy is dedicated to providing high-quality education to students from diverse backgrounds. Our experienced faculty and state-of-the-art facilities ensure that every student has the opportunity to succeed.',
        phone: '08063251569',
        email: 'cityacademy007@gmail.com',
        facebookUrl: 'https://facebook.com',
        twitterUrl: 'https://twitter.com',
        instagramUrl: 'https://instagram.com',
        linkedinUrl: 'https://linkedin.com',
        logoUrl: 'https://i.ibb.co/nMcw86GL/city-logo-removebg-preview-1.png'
      });
    }
  } catch (e: any) {
    console.error('Failed to seed admin user (DB might not be connected):', e.message);
  }

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      jsonwebtoken.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
  };

  const requireRole = (roles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    };
  };

  // API Routes
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await db.select().from(siteSettings).limit(1);
      res.json(settings[0] || {});
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.put('/api/settings', authenticate, requireRole(['admin']), async (req, res) => {
    try {
      const { mission, vision, about, phone, email, facebookUrl, twitterUrl, instagramUrl, linkedinUrl, logoUrl } = req.body;
      const existing = await db.select().from(siteSettings).limit(1);
      
      if (existing.length > 0) {
        await db.update(siteSettings).set({
          mission, vision, about, phone, email, facebookUrl, twitterUrl, instagramUrl, linkedinUrl, logoUrl
        }).where(eq(siteSettings.id, existing[0].id));
      } else {
        await db.insert(siteSettings).values({
          mission, vision, about, phone, email, facebookUrl, twitterUrl, instagramUrl, linkedinUrl, logoUrl
        });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = (await db.select().from(users).where(eq(users.username, username)).limit(1))[0];
      if (user && await bcrypt.compare(password, user.password)) {
        const token = jsonwebtoken.sign({ id: user.id, username: user.username, role: user.role, name: user.name, assignedClass: user.assignedClass }, JWT_SECRET);
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name, assignedClass: user.assignedClass } });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (err: any) {
      console.error("Login error: ", err);
      res.status(500).json({ error: 'Internal server error during login: ' + err.message });
    }
  });

  app.post('/api/auth/request-reset', async (req, res) => {
    const { username } = req.body;
    const user = (await db.select().from(users).where(eq(users.username, username)).limit(1))[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await db.insert(passwordResetRequests).values({
      userId: user.id,
      token,
      status: 'pending',
      createdAt: Date.now()
    });

    res.json({ success: true, message: 'Reset request sent to admin.' });
  });

  app.get('/api/password-resets', authenticate, requireRole(['admin']), async (req, res) => {
    const requests = await db.select({
      id: passwordResetRequests.id,
      userId: passwordResetRequests.userId,
      username: users.username,
      name: users.name,
      role: users.role,
      token: passwordResetRequests.token,
      status: passwordResetRequests.status,
      createdAt: passwordResetRequests.createdAt
    }).from(passwordResetRequests)
      .leftJoin(users, eq(passwordResetRequests.userId, users.id));
    res.json(requests);
  });

  app.post('/api/password-resets/:id/approve', authenticate, requireRole(['admin']), async (req, res) => {
    const { id } = req.params;
    await db.update(passwordResetRequests).set({ status: 'approved' }).where(eq(passwordResetRequests.id, parseInt(id)));
    const reqData = (await db.select().from(passwordResetRequests).where(eq(passwordResetRequests.id, parseInt(id))).limit(1))[0];
    res.json({ success: true, link: `/reset-password/${reqData?.token}` });
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    const resetReq = (await db.select().from(passwordResetRequests).where(and(eq(passwordResetRequests.token, token), eq(passwordResetRequests.status, 'approved'))).limit(1))[0];
    
    if (!resetReq) return res.status(400).json({ error: 'Invalid or expired reset token' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, resetReq.userId));
    await db.update(passwordResetRequests).set({ status: 'used' }).where(eq(passwordResetRequests.id, resetReq.id));

    res.json({ success: true });
  });

  app.post('/api/admin/reset-user-password', authenticate, requireRole(['admin']), async (req, res) => {
    const { userId, newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
    res.json({ success: true });
  });

  // Gallery Routes
  app.get('/api/gallery', async (req, res) => {
    const items = await db.select().from(gallery);
    res.json(items);
  });

  app.post('/api/gallery/upload', authenticate, requireRole(['admin']), upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = '/uploads/gallery/' + req.file.filename;
    await db.insert(gallery).values({
      url,
      type: 'image',
      title: req.body.title || '',
      description: req.body.description || ''
    });
    res.json({ success: true, url });
  });

  app.post('/api/gallery/video', authenticate, requireRole(['admin']), async (req, res) => {
    const { url, title, description } = req.body;
    await db.insert(gallery).values({
      url,
      type: 'video',
      title,
      description
    });
    res.json({ success: true });
  });

  app.delete('/api/gallery/:id', authenticate, requireRole(['admin']), async (req, res) => {
    await db.delete(gallery).where(eq(gallery.id, parseInt(req.params.id)));
    res.json({ success: true });
  });

  // Teachers Routes
  app.get('/api/teachers', authenticate, requireRole(['admin']), async (req, res) => {
    const allTeachers = await db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      role: users.role,
      assignedClass: users.assignedClass
    }).from(users).where(eq(users.role, 'teacher'));
    res.json(allTeachers);
  });

  app.post('/api/teachers', authenticate, requireRole(['admin']), async (req, res) => {
    const { username, name, password, assignedClass } = req.body;
    try {
      const plainPassword = password || 'staff123';

      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      await db.insert(users).values({
        username,
        password: hashedPassword,
        role: 'teacher',
        name,
        assignedClass
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/teachers/:id', authenticate, requireRole(['admin']), async (req, res) => {
    const { name, assignedClass } = req.body;
    try {
      await db.update(users).set({ name, assignedClass }).where(eq(users.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/teachers/:id', authenticate, requireRole(['admin']), async (req, res) => {
    await db.delete(users).where(and(eq(users.id, parseInt(req.params.id)), eq(users.role, 'teacher')));
    res.json({ success: true });
  });

  app.put('/api/teachers/:id', authenticate, requireRole(['admin']), async (req, res) => {
    const { assignedClass } = req.body;
    try {
      await db.update(users)
        .set({ assignedClass })
        .where(and(eq(users.id, parseInt(req.params.id)), eq(users.role, 'teacher')));
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Force Password Reset Route (Admin Only)
  app.post('/api/users/:id/force-password-reset', authenticate, requireRole(['admin']), async (req, res) => {
    const { password } = req.body;
    try {
      if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.update(users).set({ password: hashedPassword }).where(eq(users.id, parseInt(req.params.id)));
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Assignments
  app.get('/api/assignments', authenticate, async (req: any, res) => {
    try {
      const userReq = req.user;
      const userRecord = (await db.select().from(users).where(eq(users.id, userReq.id)).limit(1))[0];
      
      let items;
      if (userRecord.role === 'admin') {
        items = await db.select().from(assignments).orderBy(sql`${assignments.createdAt} DESC`);
      } else if (userRecord.role === 'teacher') {
        items = await db.select().from(assignments).where(eq(assignments.teacherId, userReq.id)).orderBy(sql`${assignments.createdAt} DESC`);
      } else if (userRecord.role === 'student') {
        const studentRec = (await db.select().from(students).where(eq(students.userId, userReq.id)).limit(1))[0];
        if (studentRec) {
          items = await db.select().from(assignments).where(eq(assignments.assignedClass, studentRec.class)).orderBy(sql`${assignments.createdAt} DESC`);
        } else {
          items = [];
        }
      }
      res.json(items || []);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/assignments', authenticate, requireRole(['teacher', 'admin']), upload.single('attachment'), async (req: any, res) => {
    try {
      const { title, description, assignedClass, teacherId } = req.body;
      const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;
      
      const teacher = req.user.role === 'teacher' ? req.user.id : parseInt(teacherId);

      await db.insert(assignments).values({
        title,
        description,
        assignedClass,
        teacherId: teacher,
        attachmentUrl
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Dashboard / Visit Stats
  app.post('/api/visits', async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await db.execute(sql`INSERT INTO site_visits (date, count) VALUES (${today}, 1) ON CONFLICT (date) DO UPDATE SET count = site_visits.count + 1`);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get('/api/visits', authenticate, requireRole(['admin']), async (req, res) => {
    try {
      const visits = await db.select().from(siteVisits).orderBy(siteVisits.date);
      res.json(visits);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Students Routes
  app.get('/api/students', authenticate, requireRole(['admin', 'teacher']), async (req, res) => {
    const allStudents = await db.select().from(students);
    res.json(allStudents);
  });

  app.post('/api/students', authenticate, requireRole(['admin', 'teacher']), async (req, res) => {
    const { studentId, name, studentClass, password, department } = req.body;
    try {
      const plainPassword = password || 'student123';

      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const userResult = await db.insert(users).values({
        username: studentId,
        password: hashedPassword,
        role: 'student',
        name
      }).returning({ id: users.id });
      
      await db.insert(students).values({
        studentId,
        userId: userResult[0].id,
        name,
        class: studentClass,
        department
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/students/:id', authenticate, requireRole(['admin']), async (req, res) => {
    const { name, studentClass, department } = req.body;
    try {
      await db.update(students).set({ name, class: studentClass, department }).where(eq(students.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/students/:id', authenticate, requireRole(['admin', 'teacher']), async (req, res) => {
    const student = (await db.select().from(students).where(eq(students.id, parseInt(req.params.id))).limit(1))[0];
    if (student) {
      await db.delete(results).where(eq(results.studentId, student.id));
      await db.delete(students).where(eq(students.id, student.id));
      if (student.userId) {
         await db.delete(users).where(eq(users.id, student.userId));
      }
    }
    res.json({ success: true });
  });

  // Student Info Route
  app.get('/api/student/info', authenticate, requireRole(['student']), async (req: any, res) => {
    const student = (await db.select().from(students).where(eq(students.userId, req.user.id)).limit(1))[0];
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const teacher = (await db.select().from(users).where(and(eq(users.role, 'teacher'), eq(users.assignedClass, student.class))).limit(1))[0];

    res.json({
      student,
      teacher: teacher ? { name: teacher.name, username: teacher.username } : null
    });
  });

  // Subjects Routes
  app.get('/api/subjects', authenticate, requireRole(['admin', 'teacher', 'student']), async (req, res) => {
    const allSubjects = await db.select().from(subjects);
    res.json(allSubjects);
  });

  app.post('/api/subjects', authenticate, requireRole(['admin', 'teacher']), upload.single('noteFile'), async (req, res) => {
    const { name, code } = req.body;
    const noteUrl = req.file ? `/uploads/${req.file.filename}` : null;
    try {
      await db.insert(subjects).values({ name, code, noteUrl });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/subjects/:id', authenticate, requireRole(['admin']), async (req, res) => {
    const { name, code } = req.body;
    try {
      await db.update(subjects).set({ name, code }).where(eq(subjects.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/subjects/:id', authenticate, requireRole(['admin', 'teacher']), async (req, res) => {
    await db.delete(results).where(eq(results.subjectId, parseInt(req.params.id)));
    await db.delete(subjects).where(eq(subjects.id, parseInt(req.params.id)));
    res.json({ success: true });
  });

  // Classes Routes
  app.get('/api/classes', authenticate, async (req, res) => {
    const allClasses = await db.select().from(classes);
    res.json(allClasses);
  });

  app.post('/api/classes', authenticate, requireRole(['admin']), async (req, res) => {
    const { name } = req.body;
    try {
      await db.insert(classes).values({ name });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/classes/:id', authenticate, requireRole(['admin']), async (req, res) => {
    const { name } = req.body;
    try {
      await db.update(classes).set({ name }).where(eq(classes.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/classes/:id', authenticate, requireRole(['admin']), async (req, res) => {
    await db.delete(classes).where(eq(classes.id, parseInt(req.params.id)));
    res.json({ success: true });
  });

  // Results Routes
  app.get('/api/results', authenticate, async (req: any, res) => {
    const { studentId, term, session, studentClass } = req.query;
    let query = db.select({
      id: results.id,
      score: results.score,
      grade: results.grade,
      term: results.term,
      session: results.session,
      firstCA: results.firstCA,
      secondCA: results.secondCA,
      exams: results.exams,
      total: results.total,
      teacherComments: results.teacherComments,
      subjectName: subjects.name,
      studentName: students.name,
      studentIdStr: students.studentId,
      studentClass: students.class
    })
    .from(results)
    .innerJoin(students, eq(results.studentId, students.id))
    .innerJoin(subjects, eq(results.subjectId, subjects.id));

    // If student or parent, restrict to their own results
    // For simplicity, assuming parent logs in with student credentials or we just check studentId
    // Actually, let's just filter by query params
    
    const allResults = await query;
    
    let filtered = allResults;
    if (studentId) filtered = filtered.filter(r => r.studentIdStr === studentId);
    if (term) filtered = filtered.filter(r => r.term === term);
    if (session) filtered = filtered.filter(r => r.session === session);
    if (studentClass) filtered = filtered.filter(r => r.studentClass === studentClass);

    res.json(filtered);
  });

  app.post('/api/results', authenticate, requireRole(['admin', 'teacher']), async (req, res) => {
    const { results: resultsData } = req.body;
    
    try {
      await db.transaction(async (tx) => {
        for (const r of resultsData) {
          const { studentId, subjectId, term, session, firstCA, secondCA, exams, teacherComments } = r;
          
          const total = (parseFloat(firstCA) || 0) + (parseFloat(secondCA) || 0) + (parseFloat(exams) || 0);
          const average = total; // Assuming average is same as total for a single subject out of 100
          
          let grade = 'F';
          if (total >= 70) grade = 'A';
          else if (total >= 60) grade = 'B';
          else if (total >= 50) grade = 'C';
          else if (total >= 40) grade = 'D';

          // Check if result already exists for this student, subject, term, session
          const existing = (await tx.select().from(results).where(
            and(
              eq(results.studentId, parseInt(studentId)),
              eq(results.subjectId, parseInt(subjectId)),
              eq(results.term, term),
              eq(results.session, session)
            )
          ).limit(1))[0];

          if (existing) {
            await tx.update(results).set({
              firstCA: parseFloat(firstCA) || 0,
              secondCA: parseFloat(secondCA) || 0,
              exams: parseFloat(exams) || 0,
              total,
              average,
              score: total, // Keep score for backward compatibility
              grade,
              teacherComments
            }).where(eq(results.id, existing.id));
          } else {
            await tx.insert(results).values({
              studentId: parseInt(studentId),
              subjectId: parseInt(subjectId),
              term,
              session,
              firstCA: parseFloat(firstCA) || 0,
              secondCA: parseFloat(secondCA) || 0,
              exams: parseFloat(exams) || 0,
              total,
              average,
              score: total,
              grade,
              teacherComments
            });
          }
        }
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Bulk Import Route
  app.post('/api/bulk-import', authenticate, requireRole(['admin', 'teacher']), upload.single('file'), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const type = req.body.type;
    
    // Only admins can upload non-results
    if (type !== 'results' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    try {
      const fileContent = fs.readFileSync(req.file.path, 'utf-8');
      const lines = fileContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) return res.status(400).json({ error: 'File is empty or missing data rows' });
      
      const headers = lines[0].split(',').map(h => h.trim());
      let count = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) continue;
        
        const row: any = {};
        headers.forEach((h, idx) => { row[h] = values[idx]; });

        if (type === 'students') {
          const plainPassword = row.password || 'student123';
          const hashedPassword = await bcrypt.hash(plainPassword, 10);
          const userResult = await db.insert(users).values({
            username: row.studentId,
            password: hashedPassword,
            role: 'student',
            name: row.name
          }).returning({ id: users.id });
          await db.insert(students).values({
            studentId: row.studentId,
            userId: userResult[0].id,
            name: row.name,
            class: row.class
          });
          count++;
        } else if (type === 'staff') {
          const plainPassword = row.password || 'staff123';
          const hashedPassword = await bcrypt.hash(plainPassword, 10);
          await db.insert(users).values({
            username: row.username,
            password: hashedPassword,
            role: 'teacher',
            name: row.name,
            assignedClass: row.assignedClass || null
          });
          count++;
        } else if (type === 'parents') {
          const plainPassword = row.password || 'parent123';
          const hashedPassword = await bcrypt.hash(plainPassword, 10);
          await db.insert(users).values({
            username: row.username,
            password: hashedPassword,
            role: 'parent',
            name: row.name
          });
          count++;
        } else if (type === 'subjects') {
          await db.insert(subjects).values({
            code: row.code,
            name: row.name
          });
          count++;
        } else if (type === 'results') {
          const student = (await db.select().from(students).where(eq(students.studentId, row.studentId)).limit(1))[0];
          const subject = (await db.select().from(subjects).where(eq(subjects.code, row.subjectCode)).limit(1))[0];
          
          if (!student) throw new Error(`Student ${row.studentId} not found`);
          if (!subject) throw new Error(`Subject ${row.subjectCode} not found`);

          const firstCA = parseFloat(row.firstCA) || 0;
          const secondCA = parseFloat(row.secondCA) || 0;
          const exams = parseFloat(row.exams) || 0;
          const total = firstCA + secondCA + exams;
          const average = total;
          
          let grade = 'F';
          if (total >= 70) grade = 'A';
          else if (total >= 60) grade = 'B';
          else if (total >= 50) grade = 'C';
          else if (total >= 40) grade = 'D';

          const existing = (await db.select().from(results).where(
            and(
              eq(results.studentId, student.id),
              eq(results.subjectId, subject.id),
              eq(results.term, row.term),
              eq(results.session, row.session)
            )
          ).limit(1))[0];

          if (existing) {
            await db.update(results).set({
              firstCA, secondCA, exams, total, average, score: total, grade
            }).where(eq(results.id, existing.id));
          } else {
            await db.insert(results).values({
              studentId: student.id,
              subjectId: subject.id,
              term: row.term,
              session: row.session,
              firstCA, secondCA, exams, total, average, score: total, grade
            });
          }
          count++;
        }
      }
      
      fs.unlinkSync(req.file.path);
      res.json({ success: true, count });
    } catch (e: any) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(400).json({ error: e.message });
    }
  });

  // Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Unhandled API Error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', async (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
