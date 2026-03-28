import { env } from './config/env';
import app from './app';

const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  console.log(`BakeBuddy server running on port ${PORT}`);
});
