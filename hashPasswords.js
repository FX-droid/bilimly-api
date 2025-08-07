const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const usersFile = path.join(__dirname, 'data/users.json');

async function hashPasswords() {
  let users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));

  for (let user of users) {
    // Skip if password looks like it's already hashed (starts with $2)
    if (!user.password.startsWith('$2')) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  }

  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  console.log('Passwords hashed successfully!');
}

hashPasswords().catch(console.error);
