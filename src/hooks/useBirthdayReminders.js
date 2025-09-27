import { useState, useEffect } from 'react';
import { useBirthdays } from '../contexts/BirthdaysContext';

const useBirthdayReminders = () => {
  const { birthdays } = useBirthdays();
  const [emailService, setEmailService] = useState(null);

  // Initialize email service (mock implementation)
  useEffect(() => {
    // This would be replaced with actual email service integration
    const mockEmailService = {
      sendEmail: async (to, subject, body) => {
        console.log('📧 Email Reminder Sent:', { to, subject, body });
        return { success: true, messageId: Date.now() };
      }
    };
    setEmailService(mockEmailService);
  }, []);

  const calculateDaysUntilBirthday = (birthday) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Create birthday date for current year
    const birthdayThisYear = new Date(birthday);
    birthdayThisYear.setFullYear(currentYear);
    
    // If birthday already passed this year, calculate for next year
    if (birthdayThisYear < today) {
      birthdayThisYear.setFullYear(currentYear + 1);
    }
    
    const timeDiff = birthdayThisYear.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff;
  };

  const getUpcomingBirthdays = () => {
    return birthdays.map(person => ({
      ...person,
      daysUntil: calculateDaysUntilBirthday(person.birthday)
    })).filter(person => person.daysUntil <= 7 && person.daysUntil >= 0);
  };

  const sendBirthdayReminder = async (person, daysUntil) => {
    if (!emailService) return;

    const userEmail = 'lucarenna76@gmail.com'; // This would come from user settings
    
    let subject, body;
    
    if (daysUntil === 7) {
      subject = `🎂 Promemoria: Compleanno di ${person.name} tra 7 giorni`;
      body = `
        Ciao!
        
        Ti ricordo che tra 7 giorni, il ${new Date(person.birthday).toLocaleDateString('it-IT')}, 
        sarà il compleanno di ${person.name}!
        
        Hai ancora tempo per organizzare qualcosa di speciale! 🎉
        
        Con affetto,
        Aurora Assistant 💜
      `;
    } else if (daysUntil === 2) {
      subject = `🎉 Ultimo promemoria: Compleanno di ${person.name} tra 2 giorni!`;
      body = `
        Ciao!
        
        Il compleanno di ${person.name} è ormai vicino! 
        Sarà il ${new Date(person.birthday).toLocaleDateString('it-IT')} (dopodomani).
        
        Non dimenticare di fare gli auguri! 🎂🎈
        
        Con affetto,
        Aurora Assistant 💜
      `;
    }

    try {
      const result = await emailService.sendEmail(userEmail, subject, body);
      console.log(`✅ Reminder sent for ${person.name} (${daysUntil} days):`, result);
      return result;
    } catch (error) {
      console.error(`❌ Failed to send reminder for ${person.name}:`, error);
      return { success: false, error };
    }
  };

  const checkAndSendReminders = async () => {
    const upcomingBirthdays = getUpcomingBirthdays();
    
    for (const person of upcomingBirthdays) {
      // Send reminder at 7 days and 2 days before
      if (person.daysUntil === 7 || person.daysUntil === 2) {
        await sendBirthdayReminder(person, person.daysUntil);
      }
    }
  };

  // Check for reminders daily
  useEffect(() => {
    // Check immediately
    checkAndSendReminders();

    // Set up daily check at 9:00 AM
    const now = new Date();
    const tomorrow9AM = new Date();
    tomorrow9AM.setDate(now.getDate() + 1);
    tomorrow9AM.setHours(9, 0, 0, 0);

    const msUntilTomorrow9AM = tomorrow9AM.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      checkAndSendReminders();
      
      // Then check every 24 hours
      const interval = setInterval(() => {
        checkAndSendReminders();
      }, 24 * 60 * 60 * 1000); // 24 hours

      return () => clearInterval(interval);
    }, msUntilTomorrow9AM);

    return () => clearTimeout(timeout);
  }, [birthdays]);

  return {
    getUpcomingBirthdays,
    sendBirthdayReminder,
    checkAndSendReminders,
    calculateDaysUntilBirthday
  };
};

export default useBirthdayReminders;