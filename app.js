// *************************************
// *********                    ********
// *************************************
// *****    Budget controller
// *************************************

var budgetController = (function() {

  // ----------------------
  //     **Expense
  // ----------------------
  // expense function constructor
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round(this.value / totalIncome * 100);
    } else {
      this.percentage = -1;
    }
  }

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  // ----------------------
  //     **Income
  // ----------------------
  // income function constructor
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    allItems: {
      expense: [],
      income: []
    },
    totals: {
      expense: 0,
      income: 0
    },
    budget: 0,
    percentage: -1
  };

  // ----------------------
  //     **calculateTotal
  // ----------------------
  var calculateTotal = function(type) {
    data.totals[type] = data.allItems[type].reduce(function(total, item){
      total = total + item.value;
      return total;
    },0 );
  }


  // public methods of Budget Controller
  return {
    // ----------------------
    //     **addItem
    // ----------------------
    addItem: function(type, des, val) {
      var newItem, ID;

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length -1].id + 1;
      } else {
        ID = 0;
      }

      // Create the new item based on 'expense' or 'income' type
      if (type === 'expense') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'income') {
        newItem = new Income(ID, des, val);
      }

      // Push it in to our data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },

    // ----------------------
    //     **deleteItem
    // ----------------------
    // delete an item from the budget model
    deleteItem: function(type, id) {
      var ids, index;

      ids = data.allItems[type].map(function(item) {
        return item.id;
      });

      index = ids.indexOf(id);

      if (index!== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    // ----------------------
    //     **calculateBudget
    // ----------------------
    calculateBudget: function() {

      // Calculate total income and expenses
      calculateTotal('income');
      calculateTotal('expense');

      // Calculate the budget: income - expenses
      data.budget = data.totals.income - data.totals.expense;

      // Caclulate the percentage of income spent
      if (data.totals.income > 0) {
        data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
      } else {
        data.percentage = -1;
      }

    },

    // ----------------------
    //     **calculatePercentages
    // ----------------------
    calculatePercentages: function() {
      data.allItems.expense.forEach(expense => expense.calcPercentage(data.totals.income));
    },

    // ----------------------
    //     **getPercentages
    // ----------------------
    getPercentages: function() {
      var allPerc = data.allItems.expense.map(function(cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },

    // ----------------------
    //     **getBudget
    // ----------------------
    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.totals.income,
        totalExpense: data.totals.expense,
        percentage: data.percentage
      }
    },



    testing: function() {
      console.log(data);
    }



  }

})();


// *************************************
// *********                    ********
// *************************************
// *****    UI Controller
// *************************************

var UIController = (function() {

  // ----------------------
  //     **formatNumber
  // ----------------------
  formatNumber = function(num, type) {
    var numSplit, int, dec;

    /*
    + or - before number
    exactly 2 decimal points
    comma separating the thousands

    2310.4567 -> + 2,310.46
    2000 -> 2,000.00
    */


    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];

    // add comma
    int = int.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

    dec = numSplit[1];

    return `${(type === 'expense' ? '-' : '+')} ${int}.${dec}`;

  }

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    addButton: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    monthLabel: '.budget__title--month'
  }



  return {

    // ----------------------
    //     *************
    // ----------------------
    // Get input data
    getInput: function() {



      return {
        // either 'income' or 'expense'
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }
    },

    // ----------------------
    //     *************
    // ----------------------
    clearFields: function() {
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(field) {
        field.value = '';
      });

      fieldsArr[0].focus();
    },

    // ----------------------
    //     *************
    // ----------------------
    addListItem: function(obj, type) {
      var html, newHtml, element;

      // Create HTML string with placeholder text
      if (type === 'income') {
        element = DOMstrings.incomeContainer;
        html = `<div class="item clearfix" id="income-%id%" data-point="figgy">
            <div class="item__description">%description%</div>
            <div class="right clearfix">
                <div class="item__value">%value%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`
      } else if (type === 'expense') {
        element = DOMstrings.expensesContainer;
        html = `<div class="item clearfix" id="expense-%id%">
            <div class="item__description">%description%</div>
            <div class="right clearfix">
                <div class="item__value">%value%</div>
                <div class="item__percentage">%percent%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`
      }

      // Replace placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value));

      // Insert HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    // ----------------------
    //     *************
    // ----------------------
    deleteListItem: function(itemId) {
      var el = document.getElementById(itemId);
      el.parentNode.removeChild(document.getElementById(itemId));
    },

    // ----------------------
    //     *************
    // ----------------------
    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'income' : type = 'expense';
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = `${formatNumber(obj.totalIncome, 'income')}`;
      document.querySelector(DOMstrings.expenseLabel).textContent = `${formatNumber(obj.totalExpense, 'expense')}`;
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = `${obj.percentage}%`;
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    // ----------------------
    //     *************
    // ----------------------
    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);



      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });

    },

    // ----------------------
    //     **getDOMstrings
    // ----------------------
    displayMonth: function() {
      var now, month, months, year;

      now = new Date();

      year = now.getFullYear();
      months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      month = now.getMonth();

      document.querySelector(DOMstrings.monthLabel).textContent = `${months[month]} ${year}`

    },

    // ----------------------
    //     **changedType
    // ----------------------
    changedType: function() {
      var fields = document.querySelectorAll(
        `${DOMstrings.inputType},
        ${DOMstrings.inputDescription},
        ${DOMstrings.inputValue}`
      );

      nodeListForEach(fields, function(cur){
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.addButton).classList.toggle('red');

    },

    // ----------------------
    //     **getDOMstrings
    // ----------------------
    getDOMstrings: function() {
      return DOMstrings;
    }

  };

})();


// *************************************
// *********                    ********
// *************************************
// *****    Global app controller
// *************************************

var controller = (function(budgetCtrl, UICtrl) {

  // ----------------------
  //     *************
  // ----------------------
  var getParentElementByClass = function(element, className, boundingId) {
  	var contNu, refElement, match;
    refElement = element;
    contNu = true;
    match = false;
    do {
    	if (refElement.parentNode && refElement.nodeName !== 'BODY') {
      	refElement = refElement.parentNode;
      } else {
      	contNu = false;
      }

      // if (refElement.classList)
      if (refElement.classList.contains(className)) {
      	match = true;
        contNu = false;
      }

      if (boundingId) {
        if (refElement.id === boundingId) {
        contNu = false;
        }
      }
    } while (contNu);

    if (match) {
    	return refElement;
    } else {
    	return false;
    }
  }

  // ----------------------
  //     *************
  // ----------------------
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.addButton).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(e) {
      if (e.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  }


  // ----------------------
  //     *************
  // ----------------------
  var updateBudget = function() {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  }

  // ----------------------
  //     *************
  // ----------------------
  var updatePercentages = function() {
    
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();

    // 2. read percentages from budget Controller
    var percentages = budgetCtrl.getPercentages();

    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);

  }


  // ----------------------
  //     *************
  // ----------------------
  var ctrlAddItem = function() {

    var input, newItem;

    // 1. Get the field input data
    input = UICtrl.getInput();

    // exit function if input is not valid
    if (input.description === '' || input.value === 0 || isNaN(input.value))
    {
      return;
    }

    // 2. Add the item to the budget Controller
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);

    // 3. Add the new item to the UI
    UICtrl.addListItem(newItem, input.type);

    // 4. Clear the fields
    UICtrl.clearFields();

    // 5. Calculate and update budget
    updateBudget();

    // 6. Calculate and update percentages
    updatePercentages();

  }

  // ----------------------
  //     *************
  // ----------------------
  var ctrlDeleteItem = function(e) {
    var splitID, type, ID;

    // if the target was not the delete button, exit funciton
    if (!e.target.classList.contains('ion-ios-close-outline')) {
      return;
    }

    // if a DOM element not returned by getParentElementByClass, exit function
    if (!getParentElementByClass(e.target, 'item')) {
      console.log('Something went wrong: ctrlDeleteItem');
      return;
    }

    // get the DOM ID of the item of which the user clicked delete
    var itemID = getParentElementByClass(e.target, 'item').id;

    // get the type and ID out of the DOM ID
    if (itemID) {
      // income-0 / expense-0
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
    }

    // 1. delete the item from the data structure
    budgetCtrl.deleteItem(type, ID);

    // 2. delete the item from the user interface
    // UICtrl.
    UICtrl.deleteListItem(itemID);

    // 3. update and show the new budget
    updateBudget();

    // 4. Calculate and update percentages
    updatePercentages();

  };

  return {

    init: function() {
      setupEventListeners();
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpense: 0,
        percentage:-1 });
      UICtrl.displayMonth();
    }
  };

})(budgetController, UIController);

controller.init();
