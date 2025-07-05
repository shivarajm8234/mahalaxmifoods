import { db } from '@/firebase/config';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp, 
  updateDoc, 
  arrayUnion, 
  collection, 
  query, 
  where, 
  getCountFromServer 
} from 'firebase/firestore';

export const recordUserActivity = async (userId: string, activityType: 'login' | 'browse' | 'purchase' = 'browse') => {
  if (!userId) return;
  
  const userRef = doc(db, 'userActivities', userId);
  const activity = {
    type: activityType,
    timestamp: serverTimestamp(),
  };

  try {
    await setDoc(userRef, {
      lastActive: serverTimestamp(),
      activities: arrayUnion(activity),
      userId,
    }, { merge: true });
  } catch (error) {
    console.error('Error recording user activity:', error);
  }
};

export const getTotalUserCount = async (): Promise<number> => {
  try {
    // Query to get all unique users who have any activity
    const activitiesRef = collection(db, 'userActivities');
    const snapshot = await getCountFromServer(activitiesRef);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error fetching total user count:', error);
    return 0; // Return 0 if there's an error or no data
  }
};
