import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../../api/auth"
import "../../components/common/AuthStyles.css"
import "./DashboardStyles.css"

const DashboardPage = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showSurveyForm, setShowSurveyForm] = useState(false)
  const [surveyData, setSurveyData] = useState({
    title: "",
    description: "",
    status: "черновик",
    startDate: "",
    endDate: "",
    questions: [
      {
        text: "Укажите ваш возраст",
        type: "single_choice",
        required: true,
        category: "Демографическая информация",
        options: [
          "До 18 лет",
          "18–25 лет",
          "26–35 лет",
          "36–45 лет",
          "46–60 лет",
          "60+ лет",
        ],
      },
      {
        text: "Ваш пол",
        type: "single_choice",
        required: true,
        category: "Демографическая информация",
        options: ["Мужской", "Женский"],
      },
      {
        text: "Ваша профессия или сфера деятельности",
        type: "single_choice",
        required: false,
        category: "Демографическая информация",
        options: [
          "Студент",
          "Фрилансер",
          "Офисный работник",
          "Руководитель/владелец бизнеса",
          "Другое",
        ],
      },
    ],
  })
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    type: "single_choice",
    required: false,
    category: "",
    options: [""],
  })
  const [categories, setCategories] = useState([
    "Демографическая информация",
    "Географическая сегментация",
    "Поведенческая сегментация",
    "Сегментация по удовлетворенности",
    "Сегментация по клиентскому пути",
    "Сегментация по мотивации и ценности клиента",
  ])
  const [newCategory, setNewCategory] = useState("")

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    } else {
      navigate("/login")
    }
  }, [navigate])

  const handleLogout = () => {
    authService.logout()
    navigate("/login")
  }

  const handleCreateSurvey = () => {
    setShowSurveyForm(true)
  }

  const handleSurveyChange = e => {
    const { name, value } = e.target
    setSurveyData({
      ...surveyData,
      [name]: value,
    })
  }

  const handleQuestionChange = (e, index) => {
    const { name, value } = e.target
    const updatedQuestions = [...surveyData.questions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [name]: value,
    }
    setSurveyData({
      ...surveyData,
      questions: updatedQuestions,
    })
  }

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...surveyData.questions]
    updatedQuestions[questionIndex].options[optionIndex] = value
    setSurveyData({
      ...surveyData,
      questions: updatedQuestions,
    })
  }

  const addOption = questionIndex => {
    const updatedQuestions = [...surveyData.questions]
    updatedQuestions[questionIndex].options.push("")
    setSurveyData({
      ...surveyData,
      questions: updatedQuestions,
    })
  }

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...surveyData.questions]
    updatedQuestions[questionIndex].options.splice(optionIndex, 1)
    setSurveyData({
      ...surveyData,
      questions: updatedQuestions,
    })
  }

  const handleRequiredChange = index => {
    const updatedQuestions = [...surveyData.questions]
    updatedQuestions[index].required = !updatedQuestions[index].required
    setSurveyData({
      ...surveyData,
      questions: updatedQuestions,
    })
  }

  const handleNewQuestionChange = e => {
    const { name, value } = e.target
    setNewQuestion({
      ...newQuestion,
      [name]: value,
    })
  }

  const handleNewOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options]
    updatedOptions[index] = value
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions,
    })
  }

  const addNewOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, ""],
    })
  }

  const removeNewOption = index => {
    const updatedOptions = [...newQuestion.options]
    updatedOptions.splice(index, 1)
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions,
    })
  }

  const addNewQuestion = () => {
    if (newQuestion.text.trim() === "") {
      alert("Вопрос не может быть пустым")
      return
    }

    setSurveyData({
      ...surveyData,
      questions: [...surveyData.questions, { ...newQuestion }],
    })

    // Сбросить форму нового вопроса
    setNewQuestion({
      text: "",
      type: "single_choice",
      required: false,
      category: newQuestion.category,
      options: [""],
    })
  }

  const removeQuestion = index => {
    if (index < 3) {
      alert("Первые три вопроса обязательны и не могут быть удалены")
      return
    }

    const updatedQuestions = [...surveyData.questions]
    updatedQuestions.splice(index, 1)
    setSurveyData({
      ...surveyData,
      questions: updatedQuestions,
    })
  }

  const addCategory = () => {
    if (newCategory.trim() === "") return

    setCategories([...categories, newCategory])
    setNewCategory("")
  }

  const saveSurvey = () => {
    // Здесь будет логика сохранения опросника на сервер
    // Для демонстрации просто выведем данные в консоль
    console.log("Сохранение опросника:", surveyData)
    alert("Опросник успешно сохранен!")
    setShowSurveyForm(false)
  }

  const cancelSurveyCreation = () => {
    if (
      window.confirm(
        "Вы уверены, что хотите отменить создание опросника? Все введенные данные будут потеряны."
      )
    ) {
      setShowSurveyForm(false)
    }
  }

  if (!user) {
    return <div>Загрузка...</div>
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Панель управления клиентским опытом</h1>
        <div className="user-info">
          <span>Пользователь: {user.username}</span>
          <button className="logout-button" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {!showSurveyForm ? (
          <div className="dashboard-actions">
            <h2>Добро пожаловать, {user.username}!</h2>
            <p>
              Управляйте клиентским опытом с помощью создания и анализа
              опросников.
            </p>

            <div className="action-buttons">
              <button className="primary-button" onClick={handleCreateSurvey}>
                Создать новый опросник
              </button>
            </div>
          </div>
        ) : (
          <div className="survey-form">
            <h2>Создание нового опросника</h2>

            <div className="form-section">
              <h3>Основная информация</h3>
              <div className="form-group">
                <label htmlFor="title">Название опросника:</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-control"
                  value={surveyData.title}
                  onChange={handleSurveyChange}
                  placeholder="Введите название опросника"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Описание:</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={surveyData.description}
                  onChange={handleSurveyChange}
                  placeholder="Введите описание опросника"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group half-width">
                  <label htmlFor="startDate">Дата начала:</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    className="form-control"
                    value={surveyData.startDate}
                    onChange={handleSurveyChange}
                  />
                </div>

                <div className="form-group half-width">
                  <label htmlFor="endDate">Дата окончания:</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    className="form-control"
                    value={surveyData.endDate}
                    onChange={handleSurveyChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="status">Статус:</label>
                <select
                  id="status"
                  name="status"
                  className="form-select"
                  value={surveyData.status}
                  onChange={handleSurveyChange}
                >
                  <option value="черновик">Черновик</option>
                  <option value="активный">Активный</option>
                  <option value="завершенный">Завершенный</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h3>Вопросы опросника</h3>
              <p className="info-text">
                Первые три вопроса являются обязательными и присутствуют во всех
                опросниках.
              </p>

              {surveyData.questions.map((question, index) => (
                <div key={index} className="question-card">
                  <div className="question-header">
                    <h4>Вопрос {index + 1}</h4>
                    {index >= 3 && (
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => removeQuestion(index)}
                      >
                        Удалить
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor={`question-${index}`}>Текст вопроса:</label>
                    <input
                      type="text"
                      id={`question-${index}`}
                      name="text"
                      className="form-control"
                      value={question.text}
                      onChange={e => handleQuestionChange(e, index)}
                      placeholder="Введите текст вопроса"
                      disabled={index < 3} // Первые три вопроса нельзя изменять
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group half-width">
                      <label htmlFor={`type-${index}`}>Тип вопроса:</label>
                      <select
                        id={`type-${index}`}
                        name="type"
                        className="form-select"
                        value={question.type}
                        onChange={e => handleQuestionChange(e, index)}
                        disabled={index < 3}
                      >
                        <option value="single_choice">
                          Один вариант ответа
                        </option>
                        <option value="multiple_choice">
                          Несколько вариантов ответа
                        </option>
                        <option value="text">Текстовый ответ</option>
                        <option value="rating">Оценка</option>
                      </select>
                    </div>

                    <div className="form-group half-width">
                      <label htmlFor={`category-${index}`}>Категория:</label>
                      <select
                        id={`category-${index}`}
                        name="category"
                        className="form-select"
                        value={question.category}
                        onChange={e => handleQuestionChange(e, index)}
                        disabled={index < 3}
                      >
                        {categories.map((category, i) => (
                          <option key={i} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id={`required-${index}`}
                      checked={question.required}
                      onChange={() => handleRequiredChange(index)}
                      disabled={index < 3}
                    />
                    <label htmlFor={`required-${index}`}>
                      Обязательный вопрос
                    </label>
                  </div>

                  {(question.type === "single_choice" ||
                    question.type === "multiple_choice") && (
                    <div className="options-container">
                      <label>Варианты ответов:</label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="option-row">
                          <input
                            type="text"
                            className="form-control"
                            value={option}
                            onChange={e =>
                              handleOptionChange(
                                index,
                                optionIndex,
                                e.target.value
                              )
                            }
                            placeholder={`Вариант ${optionIndex + 1}`}
                            disabled={index < 3}
                          />
                          {question.options.length > 1 && index >= 3 && (
                            <button
                              type="button"
                              className="delete-option-button"
                              onClick={() => removeOption(index, optionIndex)}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      {index >= 3 && (
                        <button
                          type="button"
                          className="add-option-button"
                          onClick={() => addOption(index)}
                        >
                          + Добавить вариант
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="add-question-form">
                <h4>Добавить новый вопрос</h4>

                <div className="form-group">
                  <label htmlFor="newQuestionText">Текст вопроса:</label>
                  <input
                    type="text"
                    id="newQuestionText"
                    name="text"
                    className="form-control"
                    value={newQuestion.text}
                    onChange={handleNewQuestionChange}
                    placeholder="Введите текст вопроса"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group half-width">
                    <label htmlFor="newQuestionType">Тип вопроса:</label>
                    <select
                      id="newQuestionType"
                      name="type"
                      className="form-select"
                      value={newQuestion.type}
                      onChange={handleNewQuestionChange}
                    >
                      <option value="single_choice">Один вариант ответа</option>
                      <option value="multiple_choice">
                        Несколько вариантов ответа
                      </option>
                      <option value="text">Текстовый ответ</option>
                      <option value="rating">Оценка</option>
                    </select>
                  </div>

                  <div className="form-group half-width">
                    <label htmlFor="newQuestionCategory">Категория:</label>
                    <select
                      id="newQuestionCategory"
                      name="category"
                      className="form-select"
                      value={newQuestion.category}
                      onChange={handleNewQuestionChange}
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map((category, i) => (
                        <option key={i} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="newQuestionRequired"
                    name="required"
                    checked={newQuestion.required}
                    onChange={() =>
                      setNewQuestion({
                        ...newQuestion,
                        required: !newQuestion.required,
                      })
                    }
                  />
                  <label htmlFor="newQuestionRequired">
                    Обязательный вопрос
                  </label>
                </div>

                {(newQuestion.type === "single_choice" ||
                  newQuestion.type === "multiple_choice") && (
                  <div className="options-container">
                    <label>Варианты ответов:</label>
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="option-row">
                        <input
                          type="text"
                          className="form-control"
                          value={option}
                          onChange={e =>
                            handleNewOptionChange(index, e.target.value)
                          }
                          placeholder={`Вариант ${index + 1}`}
                        />
                        {newQuestion.options.length > 1 && (
                          <button
                            type="button"
                            className="delete-option-button"
                            onClick={() => removeNewOption(index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-option-button"
                      onClick={addNewOption}
                    >
                      + Добавить вариант
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className="add-button"
                  onClick={addNewQuestion}
                >
                  Добавить вопрос
                </button>
              </div>

              <div className="add-category-form">
                <h4>Добавить новую категорию</h4>
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      placeholder="Название новой категории"
                    />
                  </div>
                  <button
                    type="button"
                    className="add-button"
                    onClick={addCategory}
                  >
                    Добавить категорию
                  </button>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="primary-button"
                onClick={saveSurvey}
              >
                Сохранить опросник
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={cancelSurveyCreation}
              >
                Отменить
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default DashboardPage
