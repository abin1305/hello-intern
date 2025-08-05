const db = require('../config/connections');
const bcrypt = require('bcrypt');
const collections = require('../config/collections');

module.exports = {
registerIntern: async (internData) => {
    const { email, password, name, university } = internData;
    const dbInstance = db.get();
    
    const existing = await dbInstance.collection(collections.INTERN_COLLECTION).findOne({ email });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    if (existing) {
        // If exists, update the data
        await dbInstance.collection(collections.INTERN_COLLECTION).updateOne(
            { email },
            {
                $set: {
                    name,
                    university,
                    password: hashedPassword, // optional: only if you're changing password
                    updatedAt: new Date(),
                }
            }
        );
        return { updated: true };
    } else {
        // Else, insert new
        await dbInstance.collection(collections.INTERN_COLLECTION).insertOne({
            email,
            password: hashedPassword,
            name,
            university,
            joinedAt: new Date(),
        });
        return { inserted: true };
    }
},
addLeaderboardEntry: async (data, sessionName) => {
    const formName = data.name?.trim().toLowerCase();
    const loggedName = sessionName?.trim().toLowerCase();
    console.log('Form name:', `"${formName}"`);
console.log('Session name:', `"${loggedName}"`);


   if (loggedName && formName !== loggedName) {
  return { status: false, message: 'Unauthorized' };
}


    const newEntry = {
      name: data.name,
      position: data.position,
      rewards: parseInt(data.rewards),
      donation: parseInt(data.donation),
      active: parseInt(data.active),
      reference: data.reference,
      submittedAt: new Date(),
    };

    await db.get().collection(collections.LEADERBOARD_COLLECTION).insertOne(newEntry);
    return { status: true };
  },

 getInternLeaderboardData: async (name) => {
  return await db.get().collection('leaderboard').findOne({ name });
}
,
getInternByEmail: async (email) => {
  return await db.get().collection('interns').findOne({ email });
}


};
