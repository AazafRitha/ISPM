import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { employeeApi } from '../../api/employee';
import placeholder from '../../assets/admin/placeholder-avatar.svg';
import './Profile.css';

export default function EmployeeProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emp, setEmp] = useState(null);
  const [form, setForm] = useState({ name: '', nic: '', email: '', address: '', password: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        // Determine current employee
        const selectedEmployee = localStorage.getItem('selectedEmployee');
        if (!selectedEmployee) throw new Error('No employee selected');
        const current = JSON.parse(selectedEmployee);
        const data = await employeeApi.getOne(current._id || current.id);
        if (!isMounted) return;
        setEmp(data);
        setForm({
          name: data.name || '',
          nic: data.nic || '',
          email: data.email || '',
          address: data.address || '',
          password: ''
        });
        setPhotoUrl(data.photoUrl || '');
      } catch (e) {
        setError(e.message || 'Failed to load profile');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const [tempUrl, setTempUrl] = useState('');
  useEffect(() => {
    if (!photoFile) { setTempUrl(''); return; }
    const u = URL.createObjectURL(photoFile);
    setTempUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [photoFile]);
  const previewSrc = tempUrl || photoUrl || placeholder;

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function onPickPhoto(e) {
    const f = e.target.files?.[0];
    if (f) setPhotoFile(f);
  }

  async function onSave(e) {
    e.preventDefault();
    if (!emp?._id) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await employeeApi.update(emp._id, {
        employeeID: emp.employeeID,
        name: form.name,
        email: form.email,
        nic: form.nic,
        address: form.address,
        password: form.password || emp.password,
        department: emp.department,
        photo: photoFile || undefined
      });
      setSuccess('Profile updated');
      setPhotoUrl(updated.employee?.photoUrl || updated.photoUrl || photoUrl);
      setForm(f => ({ ...f, password: '' }));
      // update localStorage selectedEmployee
      const selectedEmployee = localStorage.getItem('selectedEmployee');
      if (selectedEmployee) {
        const cur = JSON.parse(selectedEmployee);
        localStorage.setItem('selectedEmployee', JSON.stringify({ ...cur, name: form.name, email: form.email }));
      }
    } catch (e) {
      setError(e.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header />
      <div className="employee-profile">
        <h1 className="title">My Profile</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div className="alert error">{error}</div>
        ) : (
          <form className="profile-form" onSubmit={onSave}>
            <div className="photo-section">
              <div className="avatar"><img src={previewSrc} alt="Employee avatar" onError={(e)=>{e.currentTarget.src=placeholder;}} /></div>
              <label className="file-button">
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onPickPhoto} hidden />
                Choose Photo
              </label>
            </div>
            <div className="fields">
              <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" value={form.name} onChange={onChange} /></div>
              <div className="field"><label htmlFor="nic">NIC</label><input id="nic" name="nic" value={form.nic} onChange={onChange} /></div>
              <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" value={form.email} onChange={onChange} /></div>
              <div className="field"><label htmlFor="address">Address</label><input id="address" name="address" value={form.address} onChange={onChange} /></div>
              <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" value={form.password} onChange={onChange} placeholder="Leave blank to keep" /></div>
            </div>
            {success && <div className="alert success">{success}</div>}
            {error && <div className="alert error">{error}</div>}
            <div className="actions"><button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button></div>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
}
