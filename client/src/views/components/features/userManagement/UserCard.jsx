import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const UserCard = ({ user, handleRoleChange, handleDeleteUser, isCurrentUser }) => {
  return (
    <tr className="hover:bg-gray-600">
      <td className="border-t border-gray-700 px-4 py-2">{user.firstName || 'N/A'}</td>
      <td className="border-t border-gray-700 px-4 py-2">{user.lastName || 'N/A'}</td>
      <td className="border-t border-gray-700 px-4 py-2">{user.email || 'N/A'}</td>
      <td className="border-t border-gray-700 px-4 py-2">
        <select 
          value={user.role || 'user'} 
          onChange={(e) => handleRoleChange(user._id, e.target.value)}
          className="select select-bordered bg-gray-600 text-white w-full max-w-xs"
        >
          <option value="user">Użytkownik</option>
          <option value="admin">Administrator</option>
        </select>
      </td>
      <td className="border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-center space-x-2">
          <button 
            className="btn btn-error btn-outline btn-sm w-full sm:w-auto"
            onClick={() => handleDeleteUser(user._id)}
            disabled={isCurrentUser}
            title={isCurrentUser ? "Nie możesz usunąć siebie" : "Usuń użytkownika"}
          >
            Usuń
          </button>
          <Link to={`/admin/users/${user._id}/edit`} className="w-full sm:w-auto">
            <button 
              className="btn btn-primary btn-outline btn-sm w-full sm:w-auto"
              title="Edytuj użytkownika"
            >
              Edytuj
            </button>
          </Link>
        </div>
        {isCurrentUser && (
          <span className="text-xs text-red-500 mt-1 block text-center">Nie możesz usunąć siebie</span>
        )}
      </td>
    </tr>
  );
};

UserCard.propTypes = {
  user: PropTypes.object.isRequired,
  handleRoleChange: PropTypes.func.isRequired,
  handleDeleteUser: PropTypes.func.isRequired,
  isCurrentUser: PropTypes.bool.isRequired,
};

export default UserCard;
