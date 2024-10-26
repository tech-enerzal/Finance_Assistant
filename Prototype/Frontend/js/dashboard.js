let expenses = 0;
const categoryTotals = {
  Food: 0,
  Travel: 0,
  Bills: 0,
  Investment: 0,
  Others: 0,
};

const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'],
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    }
  }
});

function updateValues() {
  const income = parseFloat(document.getElementById('incomeInput').value) || 0;
  document.getElementById('incomeDisplay').textContent = `₹${income.toFixed(2)}`;
  const netWorth = income - expenses;
  document.getElementById('netWorthDisplay').textContent = `₹${netWorth.toFixed(2)}`;
}

function addSpend() {
  const spendName = document.getElementById('spendName').value;
  const spendAmount = parseFloat(document.getElementById('spendAmount').value) || 0;
  const spendCategory = document.getElementById('spendCategory').value;

  if (spendName && spendAmount > 0) {
    expenses += spendAmount;
    categoryTotals[spendCategory] += spendAmount;

    document.getElementById('expensesDisplay').textContent = `₹${expenses.toFixed(2)}`;
    updateValues();

    const li = document.createElement('li');
    li.className = 'transaction';
    li.textContent = `${spendName}: ₹${spendAmount.toFixed(2)} (${spendCategory})`;
    document.getElementById('transactionsList').appendChild(li);

    document.getElementById('spendName').value = '';
    document.getElementById('spendAmount').value = '';
    createOrUpdateChart();
  } else {
    alert("Please enter valid spend details.");
  }
}

function createOrUpdateChart() {
  myChart.data.datasets[0].data = Object.values(categoryTotals);
  myChart.update();
}

function startChat() {
  alert("Starting chat with your personalized chatbot!");
  window.location.href = '/pages/chat.html'; // Redirect to /pages/chat
}

function openCalculator() {
  document.getElementById('calculatorModal').style.display = "block";
}

function closeCalculator() {
  document.getElementById('calculatorModal').style.display = "none";
}

function calculateSIP() {
  const sipAmount = parseFloat(document.getElementById('sipAmount').value) || 0;
  const sipRate = parseFloat(document.getElementById('sipRate').value) || 0;
  const sipYears = parseFloat(document.getElementById('sipYears').value) || 0;

  const totalInvestment = sipAmount * sipYears * 12;
  const expectedReturn = totalInvestment * (sipRate / 100);
  const totalValue = totalInvestment + expectedReturn;

  document.getElementById('sipResult').textContent = `Total Value after ${sipYears} years: ₹${totalValue.toFixed(2)}`;
}

function calculateLoan() {
  const loanAmount = parseFloat(document.getElementById('loanAmount').value) || 0;
  const loanRate = parseFloat(document.getElementById('loanRate').value) || 0;
  const loanYears = parseFloat(document.getElementById('loanYears').value) || 0;

  const monthlyRate = loanRate / (12 * 100);
  const numberOfPayments = loanYears * 12;
  const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numberOfPayments));

  document.getElementById('loanResult').textContent = `Monthly Payment: ₹${monthlyPayment.toFixed(2)}`;
}
