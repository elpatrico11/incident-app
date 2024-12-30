import { useState, useEffect, useMemo, useCallback } from "react";
import {
  fetchUsers as fetchUsersAPI,
  updateUserRole as updateUserRoleAPI,
  deleteUser as deleteUserAPI,
} from "../../api/services/userService";
import { SORT_OPTIONS } from "../../constants/userConstants";
import useAuthStore from "../../store/useAuthStore";

const useUserManagement = () => {
  // Data States
  const [users, setUsers] = useState([]);

  // Loading States
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Feedback States
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filter, Sort, Pagination States
  const [sortConfig, setSortConfig] = useState({
    key: "firstName",
    direction: "ascending",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPageOptions = [5, 10, 20, 50];
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Current User (from Auth Store)
  const currentUser = useAuthStore((state) => state.user);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setError("");
    try {
      const data = await fetchUsersAPI();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      setError("Błąd podczas pobierania użytkowników.");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Role Change
  const handleRoleChange = useCallback(
    async (userId, newRole) => {
      const user = users.find((u) => u._id === userId);
      if (!user) return;

      if (user.role === newRole) return; // No change

      const confirmChange = window.confirm(
        `Czy na pewno chcesz zmienić rolę użytkownika ${user.email} na ${newRole}?`
      );
      if (!confirmChange) {
        setError("Zmiana roli została anulowana.");
        return;
      }

      try {
        const updatedUser = await updateUserRoleAPI(userId, newRole);
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u._id === userId ? updatedUser : u))
        );
        setSuccess("Rola użytkownika została zaktualizowana.");
        setError(""); // Clear any previous errors
      } catch (err) {
        console.error(err);
        setError("Błąd podczas aktualizacji roli użytkownika.");
      }
    },
    [users]
  );

  // Handle Delete User
  const handleDeleteUser = useCallback(
    async (userId) => {
      const user = users.find((u) => u._id === userId);
      if (!user) return;

      if (currentUser._id === userId) {
        setError("Nie możesz usunąć własnego konta.");
        return;
      }

      const confirmDelete = window.confirm(
        "Czy na pewno chcesz usunąć tego użytkownika?"
      );
      if (!confirmDelete) return;

      try {
        await deleteUserAPI(userId);
        setUsers((prevUsers) => prevUsers.filter((u) => u._id !== userId));
        setSuccess("Użytkownik został usunięty.");
        setError(""); // Clear any previous errors
      } catch (err) {
        console.error(err);
        setError("Błąd podczas usuwania użytkownika.");
      }
    },
    [users, currentUser._id]
  );

  // Handle Sorting
  const handleSort = useCallback((key, direction = "ascending") => {
    setSortConfig({ key, direction });
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (user.firstName &&
          user.firstName.toLowerCase().includes(searchLower)) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    });
  }, [users, searchTerm]);

  // Sorted Users
  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers];
    sorted.sort((a, b) => {
      const aKey = a[sortConfig.key]
        ? a[sortConfig.key].toString().toLowerCase()
        : "";
      const bKey = b[sortConfig.key]
        ? b[sortConfig.key].toString().toLowerCase()
        : "";
      if (aKey < bKey) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aKey > bKey) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [filteredUsers, sortConfig]);

  // Paginated Users
  const totalItems = sortedUsers.length;
  const totalPagesCount = useMemo(
    () => Math.ceil(totalItems / itemsPerPage),
    [totalItems, itemsPerPage]
  );

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedUsers, currentPage, itemsPerPage]);

  // Handle Page Change
  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top on page change
  }, []);

  // Handle Items Per Page Change
  const handleItemsPerPageChange = useCallback((e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  }, []);

  return {
    // Data
    users,
    paginatedUsers,
    totalItems,
    totalPagesCount,

    // Loading
    loadingUsers,

    // Feedback
    error,
    success,

    // Filters, Sorting, Pagination
    sortConfig,
    handleSort,
    searchTerm,
    setSearchTerm,
    currentPage,
    handlePageChange,
    itemsPerPage,
    handleItemsPerPageChange,
    itemsPerPageOptions,
    SORT_OPTIONS,

    // Handlers
    handleRoleChange,
    handleDeleteUser,

    // Current User
    currentUser,
  };
};

export default useUserManagement;
