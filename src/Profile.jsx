import React from 'react';
import DeletedOrdersReport from './components/DeletedOrdersReport';

export default function Profile() {
  return (
    <div className="profile-container" style={{ padding: 24 }}>
      <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div
          className="avatar"
          style={{ width: 48, height: 48, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
        >
          AW
        </div>
        <div>
          <h2 className="profile-name" style={{ margin: 0 }}>Profile</h2>
          <p className="profile-sub subtle" style={{ margin: 0, opacity: 0.7 }}>Clean slate — add your new functionality here.</p>
        </div>
      </div>

      <div className="profile-grid" style={{ display: 'grid', gap: 16 }}>
        <DeletedOrdersReport />
      </div>
    </div>
  );
}
