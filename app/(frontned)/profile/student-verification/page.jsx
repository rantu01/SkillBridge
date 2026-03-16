'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Upload, Clock, AlertCircle, X, FileText, Image as ImageIcon, Edit2 } from 'lucide-react';
import { auth } from '@/app/(backend)/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Swal from 'sweetalert2';

const StudentVerificationPage = () => {
    const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, verified, processing, rejected
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [user, setUser] = useState(null);
    const [existingDocument, setExistingDocument] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Fetch full user data from our backend to get isVerified status
                try {
                    const res = await fetch(`/api/sync-user`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        cache: 'no-store',
                        body: JSON.stringify({
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName,
                        })
                    });
                    const data = await res.json();
                    if (data.success && data.user) {
                        setUser(data.user);
                    } else {
                        setUser(currentUser);
                    }
                } catch (error) {
                    console.error("Error syncing user:", error);
                    setUser(currentUser);
                }

                await fetchExistingDocument(currentUser.uid);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const fetchExistingDocument = async (uid) => {
        try {
            const response = await fetch(`/api/get-user-verification?uid=${uid}`);
            const data = await response.json();
            if (data.hasDocument) {
                setExistingDocument(data);
                setVerificationStatus(data.status); // e.g., 'pending', 'approved', 'rejected'
            }
        } catch (error) {
            console.error('Error fetching document:', error);
        }
    };

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files?.[0];
        if (uploadedFile) {
            setFile(uploadedFile);
        }
    };

    const removeFile = () => {
        setFile(null);
        // Clear the file input if needed
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async () => {
        if (!file) {
            Swal.fire({
                icon: 'warning',
                title: 'No File Selected',
                text: 'Please select a file first',
                background: '#ffffff',
                color: '#1e293b',
                iconColor: '#f59e0b',
                customClass: {
                    popup: 'rounded-[30px] border-none shadow-2xl',
                }
            });
            return;
        }

        if (!user) {
            Swal.fire({
                icon: 'info',
                title: 'Login Required',
                text: 'Please login first',
                background: '#ffffff',
                color: '#1e293b',
                iconColor: '#2563eb',
                customClass: {
                    popup: 'rounded-[30px] border-none shadow-2xl',
                }
            });
            return;
        }

        setVerificationStatus('processing');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('uid', user.uid);

            const response = await fetch('/api/upload-verification-document', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                setVerificationStatus('pending');
                setExistingDocument({
                    status: 'pending',
                    documentUrl: previewUrl, // Temporary preview until refreshed from server
                    uploadedAt: new Date().toISOString()
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Upload Successful',
                    text: 'Document uploaded successfully! Your verification is now pending admin review.',
                    background: '#ffffff',
                    color: '#1e293b',
                    iconColor: '#2563eb',
                    customClass: {
                        popup: 'rounded-[30px] border-none shadow-2xl',
                    }
                });
                setFile(null);
            } else {
                setVerificationStatus('pending');
                Swal.fire({
                    icon: 'error',
                    title: 'Upload Failed',
                    text: 'Error uploading document: ' + result.error,
                    background: '#ffffff',
                    color: '#1e293b',
                    iconColor: '#ef4444',
                    customClass: {
                        popup: 'rounded-[30px] border-none shadow-2xl',
                    }
                });
            }
        } catch (error) {
            setVerificationStatus('pending');
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error uploading document',
                background: '#ffffff',
                color: '#1e293b',
                iconColor: '#ef4444',
                customClass: {
                    popup: 'rounded-[30px] border-none shadow-2xl',
                }
            });
        }
    };

    const isImage = file?.type.startsWith('image/');

    // Determine the overall status for UI
    // If the user object says verified in DB, we trust that (record may have been deleted)
    const isVerified = user?.isVerified === true;
    const currentStatus = isVerified ? 'approved' : (existingDocument ? existingDocument.status : verificationStatus);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">

            {/* Status Card */}
            <div className={`p-8 rounded-[30px] border-2 shadow-sm ${isVerified
                ? 'bg-green-50 border-green-200'
                : currentStatus === 'rejected'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                <div className="flex items-center gap-6">
                    {isVerified && (
                        <>
                            <div className="p-4 bg-green-100 rounded-full text-green-600">
                                <CheckCircle2 size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-green-900">Verified NWU Student</h2>
                                <p className="text-green-700 font-medium mt-1">Your student status has been successfully verified!</p>
                            </div>
                        </>
                    )}
                    {currentStatus === 'rejected' && (
                        <>
                            <div className="p-4 bg-red-100 rounded-full text-red-600">
                                <AlertCircle size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-red-900">Verification Rejected</h2>
                                <p className="text-red-700 font-medium mt-1">We couldn't verify your document. Please upload a clearer copy of your NWU ID.</p>
                            </div>
                        </>
                    )}
                    {(currentStatus === 'pending' && existingDocument) && (
                        <>
                            <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                                <Clock size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-blue-900">Verification Pending</h2>
                                <p className="text-blue-700 font-medium mt-1">Your document is currently under review by our admin team.</p>
                            </div>
                        </>
                    )}
                    {(!existingDocument && currentStatus === 'pending') && (
                        <>
                            <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                                <Clock size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-blue-900">Pending Verification</h2>
                                <p className="text-blue-700 font-medium mt-1">Upload your NWU student ID or enrollment letter to access exclusive features.</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* NWU Instructions */}
            {!existingDocument && !file && (
                <div className="bg-orange-50 p-6 rounded-[24px] border border-orange-200 flex items-start gap-4">
                    <AlertCircle className="text-orange-600 shrink-0 mt-1" size={24} />
                    <div>
                        <h3 className="text-lg font-bold text-orange-900">Instructions for NWU Students</h3>
                        <p className="text-orange-800 mt-2 text-sm leading-relaxed">
                            To get verified, please upload a clear, legible picture or scanned copy of your <strong>official North Western University (NWU) Student ID Card</strong>. If you do not have your ID card yet, an official enrollment document with your student ID number clearly visible will also be accepted. Max file size is 10MB.
                        </p>
                    </div>
                </div>
            )}

            {/* Upload Section */}
            {existingDocument ? (
                <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-gray-900">Your Verification Document</h3>
                        {currentStatus === 'rejected' && (
                            <button
                                onClick={() => setExistingDocument(null)}
                                className="px-5 py-2.5 bg-red-100 text-red-700 rounded-xl text-sm font-bold hover:bg-red-200 transition-colors"
                            >
                                Upload New Document
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50 rounded-[24px] border border-gray-200">
                        <div className="w-40 h-40 rounded-[20px] overflow-hidden border-2 border-gray-200 bg-white flex items-center justify-center p-2">
                            {existingDocument.documentUrl ? (
                                <img
                                    src={existingDocument.documentUrl}
                                    alt="Verification Document"
                                    className="w-full h-full object-contain rounded-xl"
                                />
                            ) : (
                                <FileText className="text-gray-400" size={48} />
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h4 className="font-bold text-gray-900 text-lg mb-2">Document Uploaded</h4>
                            <p className="text-sm text-gray-600 mb-4 font-medium">
                                Submitted on {new Date(existingDocument.uploadedAt).toLocaleDateString()}
                            </p>
                            <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold ${existingDocument.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : existingDocument.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${existingDocument.status === 'pending'
                                    ? 'bg-yellow-500'
                                    : existingDocument.status === 'approved'
                                        ? 'bg-green-500'
                                        : 'bg-red-500'
                                    }`}></div>
                                {existingDocument.status === 'pending' ? 'Pending Review' :
                                    existingDocument.status === 'approved' ? 'Verified' : 'Rejected'}
                            </div>
                        </div>
                    </div>

                    {existingDocument.status === 'pending' && (
                        <p className="text-sm text-gray-500 font-medium text-center">
                            Your document is currently in the review queue. We will notify you once your verification is completed.
                        </p>
                    )}
                </div>
            ) : (
                <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-xl font-black text-gray-900">Upload Document</h3>

                    {!file ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-[24px] p-10 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer block">
                                <div className="bg-white w-16 h-16 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                    <Upload className="text-blue-500" size={28} />
                                </div>
                                <p className="text-xl font-bold text-gray-900">Click to upload or drag & drop</p>
                                <p className="text-sm text-gray-500 mt-2 font-medium">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
                            </label>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-[24px] p-6 border border-gray-200">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="w-40 h-40 shrink-0 rounded-[20px] overflow-hidden border border-gray-200 bg-white flex items-center justify-center relative group p-2">
                                    {isImage && previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-contain rounded-xl"
                                        />
                                    ) : (
                                        <FileText className="text-gray-400" size={48} />
                                    )}
                                </div>
                                <div className="flex-1 w-full text-center md:text-left">
                                    <h4 className="font-bold text-gray-900 text-lg mb-1 truncate px-4 md:px-0">
                                        {file.name}
                                    </h4>
                                    <p className="text-sm text-gray-500 font-medium mb-6">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown type'}
                                    </p>

                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <input
                                            type="file"
                                            onChange={handleFileUpload}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className="hidden"
                                            id="file-change"
                                        />
                                        <label
                                            htmlFor="file-change"
                                            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer flex items-center gap-2"
                                        >
                                            <Edit2 size={16} />
                                            Change File
                                        </label>
                                        <button
                                            onClick={removeFile}
                                            className="px-5 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2"
                                        >
                                            <X size={16} />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!file && (
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h4 className="font-bold text-gray-900">Accepted Documents:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                                    <span className="text-sm font-semibold text-gray-700">NWU Student ID</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                                    <span className="text-sm font-semibold text-gray-700">Enrollment Letter</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                                    <span className="text-sm font-semibold text-gray-700">Payment Receipt</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={!file || verificationStatus === 'processing'}
                        className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-sm ${file && verificationStatus !== 'processing'
                            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md transform hover:-translate-y-0.5'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {verificationStatus === 'processing' ? 'Uploading Document...' : 'Submit Document for Verification'}
                    </button>
                </div>
            )}

            {/* Verification Perks */}
            {!isVerified && (
                <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-gray-900 mb-6">Why Verify Your Student Status?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 hover:bg-blue-50 transition-colors">
                            <p className="font-bold text-blue-900 text-lg">Access Exclusive Deals</p>
                            <p className="text-sm text-blue-700 mt-1 font-medium">Unlock special student discounts on premium services</p>
                        </div>
                        <div className="p-5 bg-green-50/50 rounded-2xl border border-green-100/50 hover:bg-green-50 transition-colors">
                            <p className="font-bold text-green-900 text-lg">Trusted Badge</p>
                            <p className="text-sm text-green-700 mt-1 font-medium">Display the verified NWU student badge on your public profile</p>
                        </div>
                        <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100/50 hover:bg-purple-50 transition-colors">
                            <p className="font-bold text-purple-900 text-lg">Higher Trust & Bookings</p>
                            <p className="text-sm text-purple-700 mt-1 font-medium">Verified student profiles receive up to 50% more engagement</p>
                        </div>
                        <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100/50 hover:bg-orange-50 transition-colors">
                            <p className="font-bold text-orange-900 text-lg">Priority Support</p>
                            <p className="text-sm text-orange-700 mt-1 font-medium">Get your issues resolved faster with our priority queue</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentVerificationPage;