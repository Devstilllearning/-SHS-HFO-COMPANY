const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.onMeetingCreated = functions.firestore
  .document('meetings/{meetingId}')
  .onCreate(async (snap, context) => {
    const meeting = snap.data();
    console.log('Meeting created:', context.params.meetingId);

    // 1. Create a notification for the member
    await db.collection('notifications').add({
      userId: meeting.memberId,
      title: 'New Meeting Request',
      message: `You have a new meeting request from ${meeting.guestName} for ${meeting.date}.`,
      type: 'info',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      link: '/dashboard/meetings'
    });

    // 2. Log activity
    await db.collection('activity').add({
      userId: meeting.memberId,
      userName: 'System',
      action: `received a new booking from ${meeting.guestName}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { meetingId: context.params.meetingId }
    });

    return null;
  });

exports.onMeetingUpdated = functions.firestore
  .document('meetings/{meetingId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== after.status) {
      // Create notification on status change
      await db.collection('notifications').add({
        userId: after.memberId,
        title: 'Meeting Status Updated',
        message: `Meeting with ${after.guestName} is now ${after.status}.`,
        type: after.status === 'confirmed' ? 'success' : 'info',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        link: '/dashboard/meetings'
      });

      // Log activity
      await db.collection('activity').add({
        userId: after.memberId,
        userName: 'System',
        action: `meeting status changed to ${after.status} for ${after.guestName}`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: { meetingId: context.params.meetingId }
      });
    }

    return null;
  });

exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
  console.log('User created:', user.uid);
  
  // Default user doc if not already created by frontend
  const userRef = db.collection('users').doc(user.uid);
  const doc = await userRef.get();
  
  if (!doc.exists) {
    await userRef.set({
      name: user.displayName || 'New Member',
      email: user.email,
      role: 'marketing_member', // Default role
      department: 'General',
      isActive: true,
      photoURL: user.photoURL || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  return null;
});
