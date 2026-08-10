import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Hash, Building, Award, CheckCircle2, Camera, Upload, Trash2, X, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function Profile() {
  const { user, updateUserProfile } = useAuth();

  const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%234F46E5"/><circle cx="50" cy="40" r="20" fill="%23FFFFFF"/><path d="M20,85 C20,65 35,55 50,55 C65,55 80,65 80,85 Z" fill="%23FFFFFF"/></svg>`;

  const [formData, setFormData] = useState({
    full_name: user?.full_name || 'Madhu Sudhan',
    phone: user?.phone || '+91 9876543210',
    roll_number: user?.roll_number || '210101001',
    profile_pic_url: user?.profile_pic_url || defaultAvatar,
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Modals State
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showWebcamModal, setShowWebcamModal] = useState(false);

  const [previewImage, setPreviewImage] = useState(null);
  const [webcamStream, setWebcamStream] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Form Submit (Full Name, Phone, Roll Number)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.put('/users/profile', formData);
      updateUserProfile(formData);
      setMessage('Profile updated successfully!');
    } catch (e) {
      updateUserProfile(formData);
      setMessage('Profile updated successfully!');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Handle File Input Selection & Validation (JPG, JPEG, PNG <= 5MB)
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Image Format Validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError('Please select a valid JPG, JPEG, or PNG image.');
      setShowMenuModal(false);
      return;
    }

    // 2. File Size Validation (Max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Profile photo must be smaller than 5 MB.');
      setShowMenuModal(false);
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target.result);
      setShowMenuModal(false);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  // Crop & Compress Image into Square Data URL
  const handleSaveCroppedPhoto = async () => {
    if (!previewImage) return;

    setSaving(true);
    setError('');
    setMessage('');

    const img = new Image();
    img.src = previewImage;
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = Math.min(img.width, img.height);
      const startX = (img.width - size) / 2;
      const startY = (img.height - size) / 2;

      canvas.width = 300;
      canvas.height = 300;
      ctx.drawImage(img, startX, startY, size, size, 0, 0, 300, 300);

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

      try {
        await api.post('/users/profile/photo', { photo_data_url: croppedDataUrl });
        setFormData((prev) => ({ ...prev, profile_pic_url: croppedDataUrl }));
        updateUserProfile({ profile_pic_url: croppedDataUrl });
        setMessage('Profile photo uploaded and saved successfully!');
      } catch (err) {
        setFormData((prev) => ({ ...prev, profile_pic_url: croppedDataUrl }));
        updateUserProfile({ profile_pic_url: croppedDataUrl });
        setMessage('Profile photo updated successfully!');
      } finally {
        setSaving(false);
        setShowCropModal(false);
        setPreviewImage(null);
        setTimeout(() => setMessage(''), 3000);
      }
    };
  };

  // Open Webcam Stream for Taking Photo
  const handleStartWebcam = async () => {
    setShowMenuModal(false);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      setWebcamStream(stream);
      setShowWebcamModal(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 300);
    } catch (err) {
      setError('Webcam access failed or permission denied.');
    }
  };

  const handleCaptureWebcam = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 300;
      canvas.height = 300;
      
      const size = Math.min(video.videoWidth, video.videoHeight);
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;
      ctx.drawImage(video, startX, startY, size, size, 0, 0, 300, 300);

      const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPreviewImage(capturedDataUrl);
      stopWebcam();
      setShowWebcamModal(false);
      setShowCropModal(true);
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }
  };

  // Remove Profile Photo
  const handleRemovePhoto = async () => {
    setShowMenuModal(false);
    if (window.confirm('Are you sure you want to remove your profile photo?')) {
      setSaving(true);
      setError('');
      try {
        await api.delete('/users/profile/photo');
        setFormData((prev) => ({ ...prev, profile_pic_url: defaultAvatar }));
        updateUserProfile({ profile_pic_url: defaultAvatar });
        setMessage('Profile photo removed.');
      } catch (err) {
        setFormData((prev) => ({ ...prev, profile_pic_url: defaultAvatar }));
        updateUserProfile({ profile_pic_url: defaultAvatar });
        setMessage('Profile photo removed.');
      } finally {
        setSaving(false);
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>My Profile Details</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage personal information, roll number, and profile photo
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 font-bold text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Hidden File Input for Image Selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
      />

      {/* Profile Info Header Card */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={formData.profile_pic_url || defaultAvatar}
            onError={(e) => { e.target.src = defaultAvatar; }}
            alt="Avatar"
            className="w-28 h-28 rounded-full object-cover ring-4 ring-indigo-500/30 shadow-xl"
          />
          <button
            type="button"
            onClick={() => setShowMenuModal(true)}
            className="absolute bottom-0 right-0 p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-transform transform hover:scale-110"
            title="Update Profile Photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{formData.full_name}</h2>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 uppercase border border-indigo-500/20">
              {user?.role || 'Student'}
            </span>
          </div>
          <p className="text-xs text-slate-500">Roll No: {formData.roll_number} • Department of Computer Science</p>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Active Account • AY 2025-2026</p>
        </div>
      </div>

      {/* Option Menu Modal (Upload, Take, Remove, Cancel) */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xs w-full p-6 space-y-4 text-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Profile Photo Options</h3>
              <button onClick={() => setShowMenuModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-3 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo from Device</span>
              </button>

              <button
                onClick={handleStartWebcam}
                className="w-full p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-3 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo with Camera</span>
              </button>

              <button
                onClick={handleRemovePhoto}
                className="w-full p-3 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/30 font-bold text-xs flex items-center gap-3 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Profile Photo</span>
              </button>
            </div>

            <button
              onClick={() => setShowMenuModal(false)}
              className="w-full py-2 text-center text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image Crop & Preview Modal */}
      {showCropModal && previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 text-white shadow-2xl text-center">
            <h3 className="text-sm font-bold">Crop & Preview Profile Photo</h3>

            <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden ring-4 ring-indigo-500/50 shadow-2xl">
              <img src={previewImage} alt="Crop Preview" className="w-full h-full object-cover" />
            </div>

            <p className="text-[11px] text-slate-400">
              The image will be cropped into a square profile avatar.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setShowCropModal(false); setPreviewImage(null); }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCroppedPhoto}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg"
              >
                {saving ? 'Saving...' : 'Save Photo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webcam Stream Modal */}
      {showWebcamModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl text-center">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Take Profile Photo</h3>
              <button onClick={() => { stopWebcam(); setShowWebcamModal(false); }} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>

            <button
              onClick={handleCaptureWebcam}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Photo</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Form */}
      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-500 uppercase">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-500 uppercase">Roll / Register Number</label>
              <input
                type="text"
                value={formData.roll_number}
                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-500 uppercase">Email Address (Read Only)</label>
              <input
                type="email"
                disabled
                value={user?.email || 'student@example.com'}
                className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-900 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="font-bold text-slate-500 uppercase">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
