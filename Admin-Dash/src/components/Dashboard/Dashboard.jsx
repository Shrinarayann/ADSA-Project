import React from 'react';
import './Dashboard.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';

function Dashboard() {
  // Mock data for charts
  const courseEnrollmentData = [
    { name: 'Computer Science', students: 21 },
    { name: 'Engineering', students: 16 },
    { name: 'Business', students: 10 },
    { name: 'Arts', students: 9 },
    { name: 'Medicine', students: 12 },
  ];

  const categoryData = [
    { name: '1st years', value: 19 },
    { name: '2nd years', value: 19 },
    { name: '3rd years', value: 19 },
    { name: '4th years', value: 19 },
  ];

  const timeData = [
    { name: 'Jan', users: 400 },
    { name: 'Feb', users: 300 },
    { name: 'Mar', users: 500 },
    { name: 'Apr', users: 450 },
    { name: 'May', users: 470 },
    { name: 'Jun', users: 580 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon students-icon">
            <i className="fas fa-user-graduate"></i>
          </div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <p className="stat-number">46</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon courses-icon">
            <i className="fas fa-book"></i>
          </div>
          <div className="stat-content">
            <h3>Total Courses</h3>
            <p className="stat-number">6</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active-icon">
            <i className="fas fa-user-tie"></i>
          </div>
          <div className="stat-content">
            <h3>Teaching Assistants</h3>
            <p className="stat-number">4</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending-icon">
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <div className="stat-content">
            <h3>Professors</h3>
            <p className="stat-number">8</p>
          </div>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart-card">
          <h3>Course Enrollments</h3>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseEnrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#4a6fa5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Student Categories</h3>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Usage Over Time</h3>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#4a6fa5" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
