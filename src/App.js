import React, { useState } from 'react';
import { collection, doc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/firebase';
import './App.css';

function LicenseLookup() {
  const [stickerNumber, setStickerNumber] = useState('');
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedInfo, setEditedInfo] = useState({});
  const [modalImage, setModalImage] = useState(null);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showRestartWarning, setShowRestartWarning] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const querySnapshot = await getDocs(collection(db, 'confirmedData'));
      const records = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const record = records.find((rec) => rec.stickerNumber === stickerNumber);

      if (record) {
        setInfo(record);
        setEditedInfo(record);
      } else {
        setError('No information found for the provided sticker number.');
        setInfo(null);
      }
    } catch (err) {
      setError('Error fetching data from the database.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
  };

  const closeModal = () => {
    setModalImage(null);
  };

  const confirmDelete = async () => {
    if (info) {
      try {
        await deleteDoc(doc(db, 'confirmedData', info.id));
        setError('Vehicle information deleted successfully.');
        setInfo(null);
      } catch (err) {
        setError('Error deleting vehicle information.');
        console.error(err);
      } finally {
        setShowDeleteWarning(false);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteWarning(false);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditedInfo({ ...editedInfo, [name]: value });
  };

  const saveEdits = async () => {
    try {
      await updateDoc(doc(db, 'confirmedData', info.id), editedInfo);
      setInfo(editedInfo);
      setEditMode(false);
      setError('Information updated successfully.');
    } catch (err) {
      setError('Error updating information.');
      console.error(err);
    }
  };

  const handleRestartClick = () => {
    setShowRestartWarning(true);
  };

  const confirmRestart = async () => {
    try {
      // Define the collections you want to delete
      const collectionsToDelete = [
        'confirmedData',
        'parkingservice',
        'pickndrop',
        'parkingfourwheel',
        'parkingtwovehicle'
      ];

      // Loop through each collection and delete all documents
      for (const collectionName of collectionsToDelete) {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const deletePromises = querySnapshot.docs.map((docSnapshot) =>
          deleteDoc(doc(db, collectionName, docSnapshot.id))
        );
        await Promise.all(deletePromises);
      }

      // Success feedback
      setError('All vehicle information deleted successfully.');
      setInfo(null);
    } catch (err) {
      setError('Error deleting all vehicle information.');
      console.error(err);
    } finally {
      setShowRestartWarning(false);
    }
  };

  const cancelRestart = () => {
    setShowRestartWarning(false);
  };

  return (
    <div className="lookup-container">
      <h1>Vehicle Sticker Number Lookup</h1>
      <form onSubmit={handleSubmit} className="search-bar">
        <input
          type="text"
          value={stickerNumber}
          onChange={(e) => setStickerNumber(e.target.value)}
          placeholder="Enter Sticker Number"
          required
        />
        <button type="submit" className="search-button">Search</button>
      </form>
      {error && <p className="error">{error}</p>}
      {isLoading && <p>Loading...</p>}
      {info && (
        <div className="columns-container">
          <div className="left-column info-display">
            <h2>Information Found:</h2>
            {editMode ? (
              <div className="edit-container">
                <h3>Edit Vehicle Information</h3>
                <div className="input-group">
                  <label>Full Name:</label>
                  <input
                    type="text"
                    name="fullName"
                    value={editedInfo.fullName}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className="edit-input"
                  />
                </div>
                <div className="input-group">
                  <label>Address:</label>
                  <input
                    type="text"
                    name="address"
                    value={editedInfo.address}
                    onChange={handleInputChange}
                    placeholder="Address"
                    className="edit-input"
                  />
                </div>
                <div className="input-group">
                  <label>Contact Number:</label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={editedInfo.contactNumber}
                    onChange={handleInputChange}
                    placeholder="Contact Number"
                    className="edit-input"
                  />
                </div>
                <div className="input-group">
                  <label>Sticker Number:</label>
                  <input
                    type="text"
                    name="stickerNumber"
                    value={editedInfo.stickerNumber}
                    onChange={handleInputChange}
                    placeholder="Sticker Number"
                    className="edit-input"
                  />
                </div>
                <div className="input-group">
                  <label>Expiry Date:</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={editedInfo.expiryDate}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </div>
                <div className="input-group">
                  <label>Registered Owner:</label>
                  <input
                    type="text"
                    name="registeredOwner"
                    value={editedInfo.registeredOwner}
                    onChange={handleInputChange}
                    placeholder="Registered Owner"
                    className="edit-input"
                  />
                </div>
                <div className="input-group">
                  <label>Plate Number:</label>
                  <input
                    type="text"
                    name="plateNumber"
                    value={editedInfo.plateNumber}
                    onChange={handleInputChange}
                    placeholder="Plate Number"
                    className="edit-input"
                  />
                </div>
                <button type="button" onClick={saveEdits} className="confirm-button">
                  Save
                </button>
              </div>
            ) : (
              <>
                <p><strong>Full Name:</strong> {info.fullName}</p>
                <p><strong>Address:</strong> {info.address}</p>
                <p><strong>Contact Number:</strong> {info.contactNumber}</p>
                <p><strong>Sticker Number:</strong> {info.stickerNumber}</p>
                <p><strong>Expiry Date:</strong> {info.expiryDate}</p>
                <p><strong>Registered Owner:</strong> {info.registeredOwner}</p>
                <p><strong>Plate Number:</strong> {info.plateNumber}</p>
              </>
            )}
          </div>

          <div className="right-column">
            <h2>Images:</h2>
            {info.driverLicenseImage && (
              <div className="image-wrapper">
                <img
                  src={info.driverLicenseImage}
                  alt="Driver's License"
                  className="info-image"
                  onClick={() => openModal(info.driverLicenseImage)}
                />
                <div className="image-label">Driver's License</div>
              </div>
            )}
            {info.carImage && (
              <div className="image-wrapper">
                <img
                  src={info.carImage}
                  alt="Car"
                  className="info-image"
                  onClick={() => openModal(info.carImage)}
                />
                <div className="image-label">Car Image</div>
              </div>
            )}
            {info.ltoRegistrationImage && (
              <div className="image-wrapper">
                <img
                  src={info.ltoRegistrationImage}
                  alt="LTO Registration"
                  className="info-image"
                  onClick={() => openModal(info.ltoRegistrationImage)}
                />
                <div className="image-label">LTO Registration</div>
              </div>
            )}
            {info.ltoReceiptImage && (
              <div className="image-wrapper">
                <img
                  src={info.ltoReceiptImage}
                  alt="LTO Receipt"
                  className="info-image"
                  onClick={() => openModal(info.ltoReceiptImage)}
                />
                <div className="image-label">LTO Receipt</div>
              </div>
            )}
          </div>
        </div>
      )}

      {modalImage && (
        <div className="modal" onClick={closeModal}>
          <img src={modalImage} alt="Enlarged" className="modal-image" />
        </div>
      )}

      {showDeleteWarning && (
        <div className="warning-modal">
          <p>Are you sure you want to delete this vehicle information?</p>
          <button onClick={confirmDelete}>Yes, Delete</button>
          <button onClick={cancelDelete}>Cancel</button>
        </div>
      )}

      {showRestartWarning && (
        <div className="warning-modal">
          <p>Are you sure you want to restart and delete all vehicle information?</p>
          <button onClick={confirmRestart}>Yes, Restart</button>
          <button onClick={cancelRestart}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default LicenseLookup;
