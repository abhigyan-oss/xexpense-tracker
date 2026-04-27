import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#A020F0", "#F4B400", "#00C49F"];

function App() {
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem("balance");
    return saved ? JSON.parse(saved) : 5000;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("expenses");
    return saved ? JSON.parse(saved) : [];
  });

  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const [income, setIncome] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("balance", JSON.stringify(balance));
  }, [expenses, balance]);

  const handleAddIncome = (e) => {
    e.preventDefault();
    if (!income) return;
    setBalance((prev) => prev + Number(income));
    setIncome("");
    setShowIncomeForm(false);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();

    if (!title || !price || !category || !date) {
      alert("Please fill all fields");
      return;
    }

    if (editId) {
      const oldExpense = expenses.find((e) => e.id === editId);
      const diff = Number(price) - oldExpense.price;

      if (diff > balance) {
        alert("Insufficient balance");
        return;
      }

      const updated = expenses.map((e) =>
        e.id === editId
          ? { ...e, title, price: Number(price), category, date }
          : e
      );

      setExpenses(updated);
      setBalance((prev) => prev - diff);
      setEditId(null);
    } else {
      if (Number(price) > balance) {
        alert("Insufficient balance");
        return;
      }

      const newExpense = {
        id: Date.now(),
        title,
        price: Number(price),
        category,
        date,
      };

      setExpenses([...expenses, newExpense]);
      setBalance((prev) => prev - Number(price));
    }

    setTitle("");
    setPrice("");
    setCategory("");
    setDate("");
    setShowExpenseForm(false);
  };

  const handleDelete = (id) => {
    const exp = expenses.find((e) => e.id === id);
    setBalance((prev) => prev + exp.price);
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const handleEditClick = (e) => {
    setTitle(e.title);
    setPrice(e.price);
    setCategory(e.category);
    setDate(e.date);
    setEditId(e.id);
    setShowExpenseForm(true);
  };

  const categoryData = Object.values(
    expenses.reduce((acc, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = { name: curr.category, value: 0 };
      }
      acc[curr.category].value += curr.price;
      return acc;
    }, {})
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Expense Tracker</h1>

      {/* TOP SECTION */}
      <div style={styles.section}>
        <div style={styles.top}>
          <div style={styles.card}>
            <h2>
              Wallet Balance:{" "}
              <span style={{ color: "#00E676" }}>
                ₹{balance.toFixed(2)}
              </span>
            </h2>

            <button
              type="button"
              style={styles.incomeBtn}
              onClick={() => setShowIncomeForm(true)}
            >
              + Add Income
            </button>
          </div>

          <div style={styles.card}>
            <h2>
              Expenses:{" "}
              <span style={{ color: "#FFC107" }}>
                ₹
                {expenses
                  .reduce((a, b) => a + b.price, 0)
                  .toFixed(2)}
              </span>
            </h2>

            <button
              type="button"
              style={styles.expenseBtn}
              onClick={() => setShowExpenseForm(true)}
            >
              + Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* INCOME MODAL */}
      {showIncomeForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>Add Balance</h3>

            <form onSubmit={handleAddIncome} style={styles.form}>
              <input
                type="number"
                placeholder="Income Amount"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />

              <div style={styles.btnRow}>
                <button type="submit" style={styles.addBtn}>
                  Add Balance
                </button>

                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowIncomeForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPENSE MODAL */}
      {showExpenseForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>{editId ? "Edit Expense" : "Add Expense"}</h3>

            <form onSubmit={handleAddExpense} style={styles.form}>
              <input
                name="title"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                name="price"
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />

              <select
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                <option value="Food">Food</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Travel">Travel</option>
              </select>

              <input
                name="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              <div style={styles.btnRow}>
                <button type="submit" style={styles.addBtn}>
                  {editId ? "Update Expense" : "Add Expense"}
                </button>

                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowExpenseForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOTTOM SECTION */}
      <div style={styles.section}>
        <div style={styles.bottom}>
          <div style={styles.transactions}>
            <h3>Recent Transactions</h3>

            {expenses.length === 0 ? (
              <p>No transactions!</p>
            ) : (
              expenses.map((e) => (
                <div key={e.id} style={styles.item}>
                  <div>
                    <strong>{e.title}</strong>
                    <p>{e.date}</p>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <span style={{ color: "#FFC107" }}>
                      ₹{e.price}
                    </span>
                    <button onClick={() => handleEditClick(e)}>✏️</button>
                    <button onClick={() => handleDelete(e.id)}>❌</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={styles.chart}>
            <h3>Top Expenses</h3>

            <PieChart width={250} height={250}>
              <Pie data={categoryData} dataKey="value" outerRadius={80}>
                {categoryData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>

            <BarChart width={250} height={200} data={categoryData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {categoryData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#2F2F2F",
    color: "white",
    minHeight: "100vh",
    padding: "30px",
  },

  heading: {
    textAlign: "center",
    marginBottom: "30px",
  },

  section: {
    background: "#3A3A3A",
    padding: "20px",
    borderRadius: "15px",
    marginBottom: "20px",
  },

  top: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },

  card: {
    background: "#9B9B9B",
    padding: "20px",
    borderRadius: "12px",
    flex: 1,
    textAlign: "center",
  },

  incomeBtn: {
    background: "#4CAF50",
    color: "white",
    padding: "10px 20px",
    borderRadius: "20px",
    border: "none",
    marginTop: "10px",
  },

  expenseBtn: {
    background: "#FF3D3D",
    color: "white",
    padding: "10px 20px",
    borderRadius: "20px",
    border: "none",
    marginTop: "10px",
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "300px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  btnRow: {
    display: "flex",
    justifyContent: "space-between",
  },

  addBtn: {
    background: "#F4B400",
    color: "white",
    border: "none",
    padding: "8px",
    borderRadius: "5px",
  },

  cancelBtn: {
    background: "#ccc",
    border: "none",
    padding: "8px",
    borderRadius: "5px",
  },

  bottom: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },

  transactions: {
    flex: 2,
    background: "#9B9B9B",
    padding: "20px",
    borderRadius: "12px",
  },

  item: {
    display: "flex",
    justifyContent: "space-between",
    background: "#7A7A7A",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
  },

  chart: {
    flex: 1,
    background: "#9B9B9B",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
  },
};

export default App;