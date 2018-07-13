// *************************************
// *********                    ********
// *************************************
// *****    Budget controller
// *************************************

var budgetController = (function() {

  // expense function constructor
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

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

  var calculateTotal = function(type) {
    data.totals[type] = data.allItems[type].reduce(function(total, item){
      total = total + item.value;
      return total;
    },0 );
  }

  return {
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
    percentLabel: '.budget__expenses--percentage'
  }

  return {

    // Get input data
    getInput: function() {

      return {
        // either 'income' or 'expense'
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }
    },

    clearFields: function() {
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(field) {
        field.value = '';
      });

      fieldsArr[0].focus();
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;

      // Create HTML string with placeholder text
      if (type === 'income') {
        element = DOMstrings.incomeContainer;
        html = `<div class="item clearfix" id="income-%id%">
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
      newHtml = newHtml.replace('%value%', obj.value);

      // Insert HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    displayBudget: function(obj) {
      document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMstrings.incomeLabel).textContent = `+ ${obj.totalIncome}`;
      document.querySelector(DOMstrings.expenseLabel).textContent = `- ${obj.totalExpense}`;
      document.querySelector(DOMstrings.percentLabel).textContent = `${obj.percentage}%`;
    },

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

  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.addButton).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(e) {

      if (e.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }

    });
  }

  var updateBudget = function() {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  }

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

  }

  return {

    init: function() {
      setupEventListeners();
    }
  };

})(budgetController, UIController);

controller.init();
