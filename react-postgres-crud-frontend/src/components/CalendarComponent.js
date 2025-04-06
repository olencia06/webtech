import React, { useState, useContext, useEffect } from "react";
import "antd/dist/reset.css";
import "./calendar.css";
import {
  Calendar,
  Card,
  List,
  Modal,
  Button,
  theme,
  message,
  Input,
} from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import moment from "moment";
import dayjs from "dayjs";
import AddTask from "../components/AddTask";
import { UserContext } from "../context/UserContext";

const Ctx = React.createContext(null);

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
        <div className="notice">📢 {notices[0].title}</div>
      )}
    </div>
  );
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

  const { token } = theme.useToken();

  const moveEvent = (oldIdx, newD) => {
    // Placeholder for drag functionality
  };

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
        const groupedByDate = allTasks.reduce((acc, task) => {
          const taskDate = dayjs(task.due_date).format("YYYY-MM-DD");
          if (!acc[taskDate]) acc[taskDate] = [];
          acc[taskDate].push(task);
          return acc;
        }, {});
        setNotices(groupedByDate);
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
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch selected date tasks");

      const selectedTasks = await res.json();

      setNotices((prev) => ({
        ...prev,
        [selectedDay]: selectedTasks,
      }));

      const upcomingRes = await fetch("http://localhost:5000/api/tasks", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const upcomingData = await upcomingRes.json();
      setUpcomingTasks(Array.isArray(upcomingData) ? upcomingData : []);
    } catch (error) {
      console.error("Error fetching date tasks:", error);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task); // Set for editing
    setShowAddTask(true); // Open AddTask modal for editing
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
    setSelectedTask(null); // Reset edit state
  };

  const calendarCardStyle = {
    width: 300,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    padding: "10px",
  };

  return (
    <Ctx.Provider value={{ setShow, setSelectedEvent, moveEvent }}>
      <DndProvider backend={HTML5Backend}>
        <div
          className="main-container"
          style={{ display: "flex", height: "100vh" }}
        >
          {/* Calendar Section */}
          <div style={{ width: selectedDate ? "30%" : "100%", padding: 20 }}>
            <Calendar
              fullscreen={false}
              onSelect={handleDateSelect}
              dateFullCellRender={(date) => {
                const day = date.format("YYYY-MM-DD");
                const isToday = date.isSame(dayjs(), "day");
                const isSelected = selectedDate === day;
                const hasTask = notices[day]?.length > 0;

                return (
                  <div
                    className="calendar-card-date"
                    style={{
                      padding: 6,
                      borderRadius: 8,
                      border: isToday
                        ? "2px solid #1890ff"
                        : "1px solid transparent",
                      backgroundColor: isSelected ? "#f0f5ff" : undefined,
                      fontWeight: isToday ? "bold" : "normal",
                    }}
                  >
                    <span>{date.format("D")}</span>
                    {hasTask && <span className="task-dot" />}
                  </div>
                );
              }}
            />
          </div>

          {/* Task Section */}
          {selectedDate && (
            <div
              className="task-section"
              style={{ flex: 1, padding: "20px", position: "relative" }}
            >
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
                  setSelectedTask(null); // Clear edit state for new task
                  setShowAddTask(true);
                }}
                style={{ marginBottom: 20 }}
              >
                Add Task
              </Button>

              <List
                bordered
                dataSource={notices[selectedDate] || []}
                renderItem={(task) => (
                  <List.Item
                    onClick={() => handleTaskClick(task)}
                    style={{ cursor: "pointer" }}
                  >
                    📌 {task.title}
                  </List.Item>
                )}
              />

              <div style={{ marginTop: 30 }}>
                <h4>Upcoming Tasks</h4>
                <List
                  bordered
                  dataSource={upcomingTasks}
                  renderItem={(task) => (
                    <List.Item key={task.id}>
                      ⏳ {task.title} - {moment(task.due_date).format("MMM D")}
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
              </div>

              {selectedTask && (
                <Card style={{ marginTop: 20, padding: 15 }}>
                  <h4>{selectedTask.title}</h4>
                  <p>Date: {selectedDate}</p>
                  <p>Details about the task...</p>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
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
          <AddTask onTaskAdd={handleTaskAdd} existingTask={selectedTask} />
        </Modal>
      </DndProvider>
    </Ctx.Provider>
  );
};

export default CalendarComponent;
