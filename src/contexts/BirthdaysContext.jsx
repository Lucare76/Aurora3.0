import { createContext, useContext, useState, useEffect } from 'react';

const BirthdaysContext = createContext();

export const useBirthdays = () => {
  const context = useContext(BirthdaysContext);
  if (!context) {
    throw new Error('useBirthdays must be used within a BirthdaysProvider');
  }
  return context;
};

export const BirthdaysProvider = ({ children }) => {
  const [birthdays, setBirthdays] = useState([]);

  // Load birthdays from localStorage on mount
  useEffect(() => {
    const savedBirthdays = localStorage.getItem('aurora-birthdays');
    if (savedBirthdays) {
      try {
        setBirthdays(JSON.parse(savedBirthdays));
      } catch (error) {
        console.error('Error loading birthdays:', error);
      }
    }
  }, []);

  // Save birthdays to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('aurora-birthdays', JSON.stringify(birthdays));
  }, [birthdays]);

  const addBirthday = (birthdayData) => {
    const newBirthday = {
      id: Date.now().toString(),
      ...birthdayData,
      createdAt: new Date().toISOString()
    };
    setBirthdays(prev => [...prev, newBirthday]);
  };

  const updateBirthday = (id, updatedData) => {
    setBirthdays(prev => 
      prev.map(birthday => 
        birthday.id === id 
          ? { ...birthday, ...updatedData, updatedAt: new Date().toISOString() }
          : birthday
      )
    );
  };

  const deleteBirthday = (id) => {
    setBirthdays(prev => prev.filter(birthday => birthday.id !== id));
  };

  const getBirthdayById = (id) => {
    return birthdays.find(birthday => birthday.id === id);
  };

  const getUpcomingBirthdays = (days = 30) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return birthdays.filter(birthday => {
      const birthdayDate = new Date(birthday.birthday);
      const thisYearBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
      
      // If birthday already passed this year, check next year
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1);
      }

      return thisYearBirthday >= today && thisYearBirthday <= futureDate;
    }).sort((a, b) => {
      const aDate = new Date(a.birthday);
      const bDate = new Date(b.birthday);
      const aThisYear = new Date(today.getFullYear(), aDate.getMonth(), aDate.getDate());
      const bThisYear = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate());
      
      if (aThisYear < today) aThisYear.setFullYear(today.getFullYear() + 1);
      if (bThisYear < today) bThisYear.setFullYear(today.getFullYear() + 1);
      
      return aThisYear - bThisYear;
    });
  };

  const value = {
    birthdays,
    addBirthday,
    updateBirthday,
    deleteBirthday,
    getBirthdayById,
    getUpcomingBirthdays
  };

  return (
    <BirthdaysContext.Provider value={value}>
      {children}
    </BirthdaysContext.Provider>
  );
};