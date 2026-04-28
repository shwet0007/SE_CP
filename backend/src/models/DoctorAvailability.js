import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class DoctorAvailability extends Model {}

DoctorAvailability.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    doctorId: { type: DataTypes.INTEGER, allowNull: false, field: 'doctor_id' },
    availableDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'available_date' },
    startTime: { type: DataTypes.STRING, allowNull: false, field: 'start_time' },
    endTime: { type: DataTypes.STRING, allowNull: false, field: 'end_time' }
  },
  {
    sequelize,
    modelName: 'DoctorAvailability',
    tableName: 'doctor_availability',
    timestamps: false
  }
);

export default DoctorAvailability;
