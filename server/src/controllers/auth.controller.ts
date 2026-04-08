import { Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase';
import { prisma } from '../config/prisma';

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function signUp(req: Request, res: Response) {
  try {
    const body = signUpSchema.parse(req.body);

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    await prisma.user.create({
      data: {
        id: data.user.id,
        email: body.email,
        name: body.name || null,
      },
    });

    // Sign in immediately after sign up
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (signInError) {
      res.status(400).json({ error: signInError.message });
      return;
    }

    res.status(201).json({
      user: { id: data.user.id, email: body.email, name: body.name },
      session: signInData.session,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.issues });
      return;
    }
    throw err;
  }
}

export async function signIn(req: Request, res: Response) {
  try {
    const body = signInSchema.parse(req.body);

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: data.user.id } });

    res.json({
      user: { id: data.user.id, email: user?.email, name: user?.name },
      session: data.session,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.issues });
      return;
    }
    throw err;
  }
}

export async function signOut(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    await supabaseAdmin.auth.admin.signOut(token);
  }
  res.json({ message: 'Signed out successfully' });
}

export async function refreshSession(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token required' });
    return;
  }

  const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session || !data.user) {
    res.status(401).json({ error: 'Failed to refresh session' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: data.user.id } });

  res.json({
    user: { id: data.user.id, email: user?.email || data.user.email, name: user?.name },
    session: data.session,
  });
}

export async function getMe(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user: { id: user.id, email: user.email, name: user.name } });
}

export async function updateMe(req: Request, res: Response) {
  const { name } = req.body;
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { name: name || null },
  });
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
}

export async function changePassword(req: Request, res: Response) {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }
  const { error } = await supabaseAdmin.auth.admin.updateUserById(req.userId!, {
    password: newPassword,
  });
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({ message: 'Password changed' });
}

export async function deleteMe(req: Request, res: Response) {
  // Delete all user data via cascade, then Supabase auth user
  await prisma.user.delete({ where: { id: req.userId } });
  await supabaseAdmin.auth.admin.deleteUser(req.userId!);
  res.json({ message: 'Account deleted' });
}
