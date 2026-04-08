import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { prisma } from '../config/prisma';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Ensure user exists in Prisma (handles users created before migration)
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || null,
      },
    });

    req.userId = user.id;
    next();
  } catch {
    res.status(401).json({ error: 'Authentication failed' });
  }
}
