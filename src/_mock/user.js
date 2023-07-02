import { faker } from '@faker-js/faker';
import { parse } from 'date-fns';
import { sample } from 'lodash';

// ----------------------------------------------------------------------

const users = [...Array(24)].map((_, index) => ({
  id: faker.datatype.uuid(),
  description: faker.name.fullName(),
  amount: faker.finance.amount() * 100,
  category : faker.finance.transactionType(),
  isExpense: faker.datatype.boolean(),
  date : faker.date.past(),
}));

const USERLIST = {
  save: (user) => {
    user.id = users.length + 1;  
    users.push(user);
    
    return user;
  },
  update: (user) => {	
    const index = users.findIndex((item) => item.id === user.id);
    users[index] = user;

    return user;
  },
  find: (id) => users.find((user) => user.id === id),
  delete: (id) => users.splice(users.findIndex((user) => user.id === id), 1),
  map: (callback) => users.map(callback),
  filter: (callback) => users.filter(callback),
  sort: (callback) => users.sort(callback),
  reduce: (callback, initialValue) => users.reduce(callback, initialValue),
  get length() {
    return users.length;
  },
  get count() {
    return users.length;
  }
}

const openDB = (name, version) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name);
    
    request.onupgradeneeded = () => {
      const db = request.result;

      // if the data object store doesn't exist, create it
      if (!db.objectStoreNames.contains(name)) {
        console.log('Creating users store');
        db.createObjectStore(name, { keyPath: 'id' });
      }
      // no need to resolve here
    };

    request.onsuccess = () => {
      const db = request.result;
      version = db.version;
      console.log('request.onsuccess - initDB', version);
      resolve(db);
    };

    request.onerror = (err) => {
      reject(err);
    };
      
  })
};


const LOCALSTORAGE = {
  key : 'users',
  save: (user) => {
    const users = LOCALSTORAGE.get();
    user.id = users.length + 1;  
    users.push(user);
    localStorage.setItem(LOCALSTORAGE.key, JSON.stringify(users));
    return user;
  },
  update: (user) => {
    const users = LOCALSTORAGE.get();
    const index = users.findIndex((item) => item.id === user.id);
    users[index] = user;
    localStorage.setItem(LOCALSTORAGE.key, JSON.stringify(users));
    return user;
  },
  find: (id) => {
    const users = LOCALSTORAGE.get();
    return users.find((user) => user.id === id);
  },
  delete: (id) => {
    const users = LOCALSTORAGE.get();
    localStorage.setItem(LOCALSTORAGE.key, JSON.stringify(users.filter((user) => user.id !== id)));
  },
  get: () => {
    return JSON.parse(localStorage.getItem(LOCALSTORAGE.key)) || [];
  },
  map: (callback) => {
    const users = LOCALSTORAGE.get();
    return users.map(callback);
  },
  filter: (callback) => {
    const users = LOCALSTORAGE.get();
    return users.filter(callback);
  },
  sort: (callback) => {
    const users = LOCALSTORAGE.get();
    return users.sort(callback);
  },
  reduce: (callback, initialValue) => {
    const users = LOCALSTORAGE.get();
    return users.reduce(callback, initialValue);
  },
  get length() {
    return LOCALSTORAGE.get().length;
  },
  get count() {
    return LOCALSTORAGE.get().length;
  },

  getMonthIncome: (month = null) => {
    month =  month ? parseInt(month, 10) : null;
  
    return  LOCALSTORAGE.filter((user) => {
      const hasPaidAt = user.paidAt !== null && user.paidAt !== undefined;

       return !user.isExpense && (month ? (parseInt(user.date.split('-')[1], 10) === month || (hasPaidAt && parseInt(user.paidAt.split('-')[1], 10) === month) ) : true)
    }).reduce((acc, user) => acc + parseInt(user.amount, 10), 0);

  },
  getMonthExpense: (month= null) => {
    month =  month ? parseInt(month, 10) : null;

    console.log( LOCALSTORAGE.filter((user) => {
      const hasPaidAt = user.paidAt !== null && user.paidAt !== undefined;
       return user.isExpense &&  (month ? (parseInt(user.date.split('-')[1], 10) === month || (hasPaidAt && parseInt(user.paidAt.split('-')[1], 10) === month) ) : true)
    }))
    return  LOCALSTORAGE.filter((user) => {
      const hasPaidAt = user.paidAt !== null && user.paidAt !== undefined;
       return user.isExpense &&  (month ? (parseInt(user.date.split('-')[1], 10) === month || (hasPaidAt && parseInt(user.paidAt.split('-')[1], 10) === month) ) : true)
    }).reduce((acc, user) => acc + parseInt(user.amount, 10), 0);

  },
  getCategoryExpenseChartData: (month = null, searchCategory = null) => {
    
    month =  month ? parseInt(month, 10) : null;
    const categories = LOCALSTORAGE.filter((user) => {
      const hasPaidAt = user.paidAt !== null && user.paidAt !== undefined;
      return user.isExpense && (month ? (parseInt(user.date.split('-')[1], 10) === month || (hasPaidAt && parseInt(user.paidAt.split('-')[1], 10) === month) ) : true) && (searchCategory ? user.category.search(searchCategory) >= 0 : true)
    }).reduce((acc, user) => {
      const category = user.category.split(',')[0].toUpperCase().trim();
  
      if(acc[category]) {
        acc[category] += parseFloat(parseInt(user.amount, 10) / 100);
      } else {
        acc[category] = parseFloat(parseInt(user.amount, 10) / 100);
      }

      
      return acc;
    }, {});

    return Object.keys(categories).map((key) => {
      return {
        label: key,
        value: categories[key]
      }
    });
  },
  

  getExpensesByCreditCardChartData: (month = null, searchCreditCard = null) => {

    month =  month ? parseInt(month, 10) : null;

    console.log('month', month);
    console.log('searchCreditCard', searchCreditCard);
    const creditCards = LOCALSTORAGE.filter((user) => {
      console.log('user', (user.isExpense && user.isCreditCardExpense) === true);
      return user.isExpense && ((month && user.paidAt) ? parseInt(user.paidAt.split('-')[1], 10) === month : true) && ((searchCreditCard && user.creditCard) ? user.creditCard.indexOf(searchCreditCard) >= 0 : true)
    }
    ).reduce((acc, user) => {
      const creditCard = user.creditCard;
      
      if (!creditCard) {
        return acc;
      }

      if(acc[creditCard]) {
        acc[creditCard] += parseInt(user.amount, 10) / 100;
      } else {
        acc[creditCard] = parseInt(user.amount, 10) / 100;
      }      
      return acc;
    }, {});

    console.log('creditCards', creditCards);
    return Object.keys(creditCards).map((key) => {
      return {
        label: key,
        value: creditCards[key]
      }
    }
    );
  },

}
export default LOCALSTORAGE;
