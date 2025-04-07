import React, { useState, useContext, useEffect } from "react";
import {
  Calendar,
  Card,
  List,
  Modal,
  Button,
  theme,
  message,
  Input,
  Popconfirm,
} from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import moment from "moment";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import dayjs from "dayjs";
import AddTask from "../components/AddTask";
import { UserContext } from "../context/UserContext";
import "antd/dist/reset.css";
import "./calendar.css";
dayjs.extend(isSameOrBefore);
// Context for internal communication
const Ctx = React.createContext(null);

// Drag-enabled event item
const EventCell = ({ event, eventIdx }) => {
  const [, drag] = useDrag({
    type: "event",
    item: { event, eventIdx },
  });

  const { setShow, setSelectedEvent } = useContext(Ctx);

  return (
    <li
      ref={drag}
      className="event-item"
      onClick={() => {
        setSelectedEvent(event);
        setShow(true);
      }}
    >
      {event.title}
    </li>
  );
};

// Drop-enabled calendar day cell
const CalendarCell = ({ date, events, notices, isCardView }) => {
  const { moveEvent } = useContext(Ctx);
  const [, drop] = useDrop({
    accept: "event",
    drop: (item) => moveEvent(item.eventIdx, date.format("D")),
  });

  const isToday = date.isSame(moment(), "day");
  const hasTask = notices.length > 0;

  return (
    <div ref={drop} className={`calendar-cell ${isToday ? "today-cell" : ""}`}>
      <div className="date-label">
        {date.format("D")}
        {isCardView && hasTask && <span className="task-dot" />}
      </div>
      <ul className="event-list">
        {events.map((event, idx) => (
          <EventCell key={event.id} event={event} eventIdx={idx} />
        ))}
      </ul>
      {!isCardView && hasTask && (
        <div className="notice">Notice Title: {notices[0].title}</div>
      )}
    </div>
  );
};

// Color utility
const getPriorityColor = (priority) => {
  switch (priority) {
    case "High":
      return "#ff4d4f";
    case "Medium":
      return "#faad14";
    case "Low":
      return "#52c41a";
    default:
      return "#d9d9d9";
  }
};

const CalendarComponent = ({ setBreadcrumbExtra }) => {
  const { user } = useContext(UserContext);
  const [show, setShow] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [notices, setNotices] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCardView, setIsCardView] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [notes, setNotes] = useState("");
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());

  const yearOptions = [];
  for (let i = 2020; i <= 2035; i++) {
    yearOptions.push({ label: i, value: i });
  }

  const monthOptions = dayjs.months().map((month, index) => ({
    label: month,
    value: index,
  }));

  const onYearMonthChange = (year, month) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const { token } = theme.useToken();

  const moveEvent = (oldIdx, newD) => {
    // Placeholder for drag functionality
  };

  // Fetch all tasks and group by date
  useEffect(() => {
    const fetchAllTasks = async () => {
      if (!user || !user.token) return;

      try {
        const res = await fetch("http://localhost:5000/api/tasks", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch tasks");

        const allTasks = await res.json();
        const grouped = allTasks.reduce((acc, task) => {
          const taskDate = dayjs(task.due_date).format("YYYY-MM-DD");
          if (!acc[taskDate]) acc[taskDate] = [];
          acc[taskDate].push(task);
          return acc;
        }, {});
        setNotices(grouped);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchAllTasks();
  }, [user]);

  const handleDateSelect = async (date) => {
    const selectedDay = date.format("YYYY-MM-DD");
    setSelectedDate(selectedDay);
    if (!isCardView) setIsCardView(true);
    setBreadcrumbExtra?.("Tasks");

    try {
      const res = await fetch(
        `http://localhost:5000/api/tasks?date=${selectedDay}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      const selectedTasks = await res.json();

      setNotices((prev) => ({
        ...prev,
        [selectedDay]: selectedTasks,
      }));

      const upcomingRes = await fetch("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const upcomingData = await upcomingRes.json();
      setUpcomingTasks(Array.isArray(upcomingData) ? upcomingData : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowAddTask(true);
  };

  const handleCancelView = () => {
    setIsCardView(false);
    setSelectedDate(null);
    setSelectedTask(null);
    setBreadcrumbExtra?.(null);
  };

  const handleTaskAdd = (newTask) => {
    const taskDay = dayjs(newTask.due_date).format("YYYY-MM-DD");

    setNotices((prev) => {
      const updated = { ...prev };
      const existing = updated[taskDay] || [];
      const filtered = existing.filter((t) => t.id !== newTask.id);
      updated[taskDay] = [...filtered, newTask];
      return updated;
    });

    message.success(selectedTask ? "Task updated!" : "Task added!");
    setShowAddTask(false);
    setSelectedTask(null);
  };

  const handleToggleComplete = async (task) => {
    if (!user || !user.token) return;

    try {
      const updatedTask = {
        ...task,
        is_completed: !task.is_completed, // ✅ fix: use `is_completed` instead of `completed`
        due_date: dayjs(task.due_date).format("YYYY-MM-DD"), // ensure date consistency
      };

      const res = await fetch(`http://localhost:5000/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(updatedTask),
      });

      if (!res.ok) throw new Error("Failed to update task");

      const updated = await res.json(); // ✅ get the saved task from backend
      handleTaskAdd(updated); // ensure UI state reflects actual saved version
    } catch (error) {
      console.error("Error toggling completion:", error);
      message.error("Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!user || !user.token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) throw new Error("Failed to delete task");

      setNotices((prev) => {
        const updated = { ...prev };
        const dayTasks = updated[selectedDate] || [];
        updated[selectedDate] = dayTasks.filter((task) => task.id !== taskId);
        return updated;
      });

      message.success("Task deleted!");
    } catch (error) {
      console.error("Error deleting task:", error);
      message.error("Failed to delete task");
    }
  };

  const exportNotes = () => {
    const blob = new Blob([notes], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `notes-${selectedDate || "calendar"}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Ctx.Provider value={{ setShow, setSelectedEvent, moveEvent }}>
      <DndProvider backend={HTML5Backend}>
        <div style={{ display: "flex", height: "100vh" }}>
          <div style={{ width: selectedDate ? "30%" : "100%", padding: 20 }}>
            <Calendar
              fullscreen={false}
              value={dayjs(`${currentYear}-${currentMonth + 1}-01`)}
              onSelect={handleDateSelect}
              onPanelChange={(value) => {
                setCurrentYear(value.year());
                setCurrentMonth(value.month());
              }}
              headerRender={() => (
                <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
                  <select
                    value={currentYear}
                    onChange={(e) =>
                      onYearMonthChange(Number(e.target.value), currentMonth)
                    }
                  >
                    {yearOptions.map((y) => (
                      <option key={y.value} value={y.value}>
                        {y.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={currentMonth}
                    onChange={(e) =>
                      onYearMonthChange(currentYear, Number(e.target.value))
                    }
                  >
                    {monthOptions.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              dateFullCellRender={(date) => {
                const day = date.format("YYYY-MM-DD");
                const isToday = date.isSame(dayjs(), "day");
                const isSelected = selectedDate === day;
                const tasks = notices[day] || [];

                return (
                  <div
                    style={{
                      padding: 6,
                      borderRadius: 8,
                      border: isToday
                        ? "2px solid #1890ff"
                        : "1px solid transparent",
                      backgroundColor: isSelected ? "#f0f5ff" : undefined,
                      fontWeight: isToday ? "bold" : "normal",
                      minHeight: 60,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{date.format("D")}</span>
                      {isCardView && tasks.length > 0 && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: "#1890ff",
                            marginLeft: 4,
                            marginTop: 2,
                            display: "inline-block",
                          }}
                        />
                      )}
                    </div>

                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        style={{
                          fontSize: "0.75rem",
                          backgroundColor: "#e6f7ff",
                          borderLeft: `4px solid ${getPriorityColor(
                            task.priority
                          )}`,
                          borderRadius: 4,
                          padding: "2px 6px",
                          marginTop: 4,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={`${task.title} (${task.priority || "None"})`}
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                );
              }}
            />
          </div>

          {selectedDate && (
            <div style={{ flex: 1, padding: 20, position: "relative" }}>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={handleCancelView}
                style={{ position: "absolute", top: 0, right: 0 }}
              />
              <h3>Tasks for {selectedDate}</h3>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedTask(null);
                  setShowAddTask(true);
                }}
                style={{ marginBottom: 20 }}
              >
                Add Task
              </Button>

              <List
                bordered
                dataSource={notices[selectedDate] || []}
                renderItem={(task) => {
                  const isTodayOrEarlier = dayjs(task.due_date).isSameOrBefore(
                    dayjs(),
                    "day"
                  );

                  return (
                    <List.Item
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {isTodayOrEarlier && (
                          <input
                            type="checkbox"
                            checked={task.is_completed}
                            onChange={() => handleToggleComplete(task)}
                            style={{ cursor: "pointer" }}
                          />
                        )}
                        <span
                          onClick={() => handleTaskClick(task)}
                          style={{
                            cursor: "pointer",
                            textDecoration: task.is_completed ? "" : "none",
                          }}
                        >
                          {task.title}
                        </span>
                      </div>

                      <Popconfirm
                        title="Are you sure you want to delete this task?"
                        onConfirm={() => handleDeleteTask(task.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button type="text" danger size="small">
                          Delete
                        </Button>
                      </Popconfirm>
                    </List.Item>
                  );
                }}
              />

              <div style={{ marginTop: 30 }}>
                <h4>Upcoming Tasks</h4>
                <List
                  bordered
                  dataSource={upcomingTasks}
                  renderItem={(task) => (
                    <List.Item key={task.id}>
                      <div>
                        {moment(task.due_date).format("MMM D")}
                        <br />
                        {task.title}
                      </div>
                    </List.Item>
                  )}
                />
              </div>

              <div style={{ marginTop: 20 }}>
                <h4>Notes</h4>
                <Input.TextArea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write your notes here..."
                  rows={4}
                />
                <Button onClick={exportNotes} style={{ marginTop: 10 }}>
                  Export Notes
                </Button>
              </div>
            </div>
          )}
        </div>

        <Modal
          open={show}
          onOk={() => setShow(false)}
          onCancel={() => setShow(false)}
        >
          <h3>Event Details</h3>
          <p>{selectedEvent?.title}</p>
        </Modal>

        <Modal
          open={showAddTask}
          footer={null}
          onCancel={() => {
            setShowAddTask(false);
            setSelectedTask(null);
          }}
        >
          <AddTask
            onTaskAdd={handleTaskAdd}
            existingTask={selectedTask}
            defaultDate={selectedDate}
          />
        </Modal>
      </DndProvider>
    </Ctx.Provider>
  );
};

export default CalendarComponent;
