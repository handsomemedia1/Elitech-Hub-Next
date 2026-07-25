import React from 'react';
import PageLayout from '@/components/PageLayout';
import { Users, Search, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import styles from './users.module.css';

export default function AdminUsers() {
  const users = [
    { id: 1, name: 'Alex Johnson', email: 'alex@example.com', role: 'Student', enrolled: 'Cybersecurity 16-Week', status: 'Active' },
    { id: 2, name: 'Sarah Williams', email: 'sarah@example.com', role: 'Student', enrolled: 'Web Dev', status: 'Active' },
    { id: 3, name: 'Michael Chen', email: 'michael@example.com', role: 'Alumni', enrolled: 'Completed (2025)', status: 'Inactive' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', role: 'Student', enrolled: 'Cybersecurity 16-Week', status: 'Active' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>Manage student enrollments and platform users</p>
        </div>
        <button className={styles.primaryBtn}>
          <Users size={18} /> Add New User
        </button>
      </header>

      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input type="text" placeholder="Search by name or email..." className={styles.searchInput} />
        </div>
        <select className={styles.filterSelect}>
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="alumni">Alumni</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Enrolled Program</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className={styles.tdName}>
                  <div className={styles.avatar}>{user.name.charAt(0)}</div>
                  {user.name}
                </td>
                <td>{user.email}</td>
                <td><span className={styles.badge}>{user.role}</span></td>
                <td>{user.enrolled}</td>
                <td>
                  <span className={`${styles.statusBadge} ${user.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.iconBtn} title="Edit"><Edit2 size={16} /></button>
                    <button className={styles.iconBtn} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}