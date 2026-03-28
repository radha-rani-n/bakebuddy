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

export async function getMe(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user: { id: user.id, email: user.email, name: user.name } });
}
