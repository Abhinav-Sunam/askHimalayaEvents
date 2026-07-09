import styles from './SearchBar.module.css';

export default function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className={styles.searchWrapper} id="search-bar">
      <div className={styles.searchContainer}>
        <svg className={styles.searchIcon} viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.5 3C6.36 3 3 6.36 3 10.5S6.36 18 10.5 18c1.71 0 3.29-.57 4.56-1.53l5.47 5.47 1.41-1.41-5.47-5.47A7.46 7.46 0 0018 10.5C18 6.36 14.64 3 10.5 3zm0 2C13.54 5 16 7.46 16 10.5S13.54 16 10.5 16 5 13.54 5 10.5 7.46 5 10.5 5z" fill="currentColor"/>
        </svg>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search events, workshops, speakers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}
