export default function Item({
  id,
  name,
  done,
  quantity,
  handleDeleteItems,
  handleToggleItem,
}) {
  return (
    <li className={done ? "completed" : ""}>
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          checked={done}
          onChange={() => handleToggleItem(id)}
          onTouchStart={() => handleToggleItem(id)}
        />
        <label>{name}</label>
        <button
          className="destroy"
          onClick={() => handleDeleteItems(id)}
        ></button>
      </div>
      {/* <input className="edit" value="Create a TodoMVC template" />  */}
    </li>
  );
}
