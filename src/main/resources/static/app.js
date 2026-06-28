// API base endpoint configuration
const API_BASE = '/api/surveys';

// Helper function to show notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
        <span>${message}</span>
    `;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

// Switch between dashboard and creator views
function showView(viewName) {
    const dashboard = document.getElementById('dashboard-view');
    const creator = document.getElementById('creator-view');

    if (viewName === 'dashboard') {
        if (dashboard) dashboard.classList.remove('hidden');
        if (creator) creator.classList.add('hidden');
        loadSurveys();
    } else if (viewName === 'creator') {
        if (dashboard) dashboard.classList.add('hidden');
        if (creator) creator.classList.remove('hidden');
        resetCreatorForm();
    }
}

// -------------------------------------------------------------
// DASHBOARD LOGIC
// -------------------------------------------------------------

// Fetch and display all surveys
async function loadSurveys() {
    const surveysList = document.getElementById('surveys-list');
    const emptyState = document.getElementById('empty-state');
    const statSurveys = document.getElementById('stat-surveys-count');
    const statResponses = document.getElementById('stat-responses-count');

    if (!surveysList) return;

    try {
        const response = await fetch(API_BASE);
        if (!response.ok) throw new Error('Failed to fetch surveys');
        const surveys = await response.json();

        // Update stats
        if (statSurveys) statSurveys.textContent = surveys.length;

        if (surveys.length === 0) {
            emptyState.classList.remove('hidden');
            // Hide all child nodes except empty-state
            Array.from(surveysList.children).forEach(child => {
                if (child !== emptyState) child.remove();
            });
            if (statResponses) statResponses.textContent = '0';
            return;
        }

        emptyState.classList.add('hidden');

        // Clear previous list (except empty state)
        Array.from(surveysList.children).forEach(child => {
            if (child !== emptyState) child.remove();
        });

        let totalResponsesCount = 0;

        for (const survey of surveys) {
            // Fetch response count for each survey
            let responseCount = 0;
            try {
                const res = await fetch(`${API_BASE}/${survey.id}/responses`);
                if (res.ok) {
                    const responsesList = await res.json();
                    responseCount = responsesList.length;
                    totalResponsesCount += responseCount;
                }
            } catch (err) {
                console.error(`Error loading response count for survey ${survey.id}:`, err);
            }

            const card = document.createElement('div');
            card.className = 'card survey-card';
            card.innerHTML = `
                <div class="survey-card-header">
                    <h3>${escapeHTML(survey.title)}</h3>
                    <span class="survey-date">${new Date(survey.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="survey-card-body">
                    <p>${escapeHTML(survey.description || 'No description provided.')}</p>
                    <div style="margin-bottom: 1rem; font-size: 0.85rem; color: var(--text-muted);">
                        <i class="fa-solid fa-list-check"></i> ${survey.questions.length} Questions &nbsp;&nbsp;&nbsp;
                        <i class="fa-solid fa-reply"></i> ${responseCount} Responses
                    </div>
                </div>
                <div>
                    <div class="survey-card-actions">
                        <a href="take.html?id=${survey.id}" target="_blank" class="btn btn-primary btn-xs"><i class="fa-solid fa-external-link"></i> Open Form</a>
                        <a href="results.html?id=${survey.id}" class="btn btn-secondary btn-xs"><i class="fa-solid fa-chart-simple"></i> Results</a>
                    </div>
                    <div class="survey-card-footer">
                        <button class="btn btn-text btn-block btn-xs" onclick="copyLink(${survey.id})"><i class="fa-solid fa-copy"></i> Copy Share Link</button>
                    </div>
                </div>
            `;
            surveysList.appendChild(card);
        }

        if (statResponses) statResponses.textContent = totalResponsesCount;

    } catch (error) {
        console.error(error);
        showToast('Error loading surveys from server.', 'error');
    }
}

// Copy sharing link to clipboard
function copyLink(surveyId) {
    const shareUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}take.html?id=${surveyId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Share link copied to clipboard!');
    }).catch(err => {
        console.error('Could not copy link:', err);
        showToast('Failed to copy link.', 'error');
    });
}

// Load default mock/demo data
async function loadDemoData() {
    const demoSurveys = [
        {
            title: "Developer Environment Preferences",
            description: "A quick feedback collection to understand IDE choices, OS choices, and team workflows.",
            questions: [
                {
                    text: "What is your primary Operating System for development?",
                    type: "MULTIPLE_CHOICE",
                    options: ["Windows", "macOS", "Linux", "BSD / Other"]
                },
                {
                    text: "Which Integrated Development Environment (IDE) or Text Editor do you use most?",
                    type: "MULTIPLE_CHOICE",
                    options: ["IntelliJ IDEA", "Visual Studio Code", "Eclipse", "Vim / Neovim", "Emacs"]
                },
                {
                    text: "What is your single biggest development environment pain point?",
                    type: "TEXT",
                    options: []
                }
            ]
        },
        {
            title: "Quick Team Pulse Check",
            description: "Weekly anonymous team check-in to identify blocks and morale.",
            questions: [
                {
                    text: "How is your current workload feeling?",
                    type: "MULTIPLE_CHOICE",
                    options: ["Very Light", "Manageable", "Slightly High", "Overwhelming"]
                },
                {
                    text: "Are you facing any blockers that need intervention?",
                    type: "MULTIPLE_CHOICE",
                    options: ["No blockers", "Minor code issues", "Waiting on code reviews", "Requirements are unclear"]
                },
                {
                    text: "Any suggestions for improving team processes this week?",
                    type: "TEXT",
                    options: []
                }
            ]
        }
    ];

    try {
        for (const survey of demoSurveys) {
            await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(survey)
            });
        }
        showToast("Demo surveys loaded successfully!");
        loadSurveys();
    } catch (err) {
        console.error(err);
        showToast("Error loading demo data.", "error");
    }
}

// -------------------------------------------------------------
// CREATOR LOGIC
// -------------------------------------------------------------

let questionCounter = 0;

function resetCreatorForm() {
    document.getElementById('survey-form').reset();
    document.getElementById('questions-list').innerHTML = '';
    questionCounter = 0;
}

// Add a question to the form creation board
function addQuestion(type) {
    questionCounter++;
    const container = document.getElementById('questions-list');
    const qDiv = document.createElement('div');
    qDiv.className = 'question-creator-card';
    qDiv.dataset.type = type;
    qDiv.dataset.qid = questionCounter;

    let optionsHtml = '';
    if (type === 'MULTIPLE_CHOICE') {
        optionsHtml = `
            <div class="options-builder">
                <label>Options</label>
                <div class="options-container" id="options-container-${questionCounter}">
                    <div class="option-builder-row">
                        <input type="text" placeholder="Option 1" required class="option-input">
                        <button type="button" class="btn btn-danger btn-xs" onclick="removeOptionRow(this)"><i class="fa-solid fa-trash"></i></button>
                    </div>
                    <div class="option-builder-row">
                        <input type="text" placeholder="Option 2" required class="option-input">
                        <button type="button" class="btn btn-danger btn-xs" onclick="removeOptionRow(this)"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <button type="button" class="btn btn-secondary btn-xs" onclick="addOptionRow(${questionCounter})" style="margin-top: 0.5rem;"><i class="fa-solid fa-plus"></i> Add Option</button>
            </div>
        `;
    }

    qDiv.innerHTML = `
        <div class="question-creator-header">
            <span class="question-num">Question #${questionCounter}</span>
            <span class="question-badge">${type === 'MULTIPLE_CHOICE' ? 'Multiple Choice' : 'Text Response'}</span>
        </div>
        <div class="form-group">
            <input type="text" placeholder="Enter question description/text here..." required class="question-text-input">
        </div>
        ${optionsHtml}
        <button type="button" class="btn btn-danger btn-xs" onclick="removeQuestionCard(this)" style="position: absolute; top: 1.25rem; right: 1.5rem;"><i class="fa-solid fa-trash"></i> Delete</button>
    `;

    container.appendChild(qDiv);
    qDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function removeQuestionCard(button) {
    button.closest('.question-creator-card').remove();
    // Reindex remaining questions labels
    const cards = document.querySelectorAll('.question-creator-card');
    cards.forEach((card, index) => {
        card.querySelector('.question-num').textContent = `Question #${index + 1}`;
    });
}

function addOptionRow(qId) {
    const container = document.getElementById(`options-container-${qId}`);
    const row = document.createElement('div');
    row.className = 'option-builder-row';
    const optNum = container.children.length + 1;
    row.innerHTML = `
        <input type="text" placeholder="Option ${optNum}" required class="option-input">
        <button type="button" class="btn btn-danger btn-xs" onclick="removeOptionRow(this)"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(row);
}

function removeOptionRow(button) {
    const container = button.closest('.options-container');
    if (container.children.length <= 1) {
        showToast('Multiple-choice questions need at least one option!', 'error');
        return;
    }
    button.closest('.option-builder-row').remove();
    // Rename option placeholders
    Array.from(container.children).forEach((row, idx) => {
        row.querySelector('.option-input').placeholder = `Option ${idx + 1}`;
    });
}

// Collect form data and send POST request to create a survey
async function saveSurvey(event) {
    event.preventDefault();

    const title = document.getElementById('survey-title').value.trim();
    const description = document.getElementById('survey-desc').value.trim();
    const questionCards = document.querySelectorAll('.question-creator-card');

    if (questionCards.length === 0) {
        showToast('Please add at least one question to your survey.', 'error');
        return;
    }

    const questions = [];
    questionCards.forEach(card => {
        const text = card.querySelector('.question-text-input').value.trim();
        const type = card.dataset.type;
        const options = [];

        if (type === 'MULTIPLE_CHOICE') {
            const optInputs = card.querySelectorAll('.option-input');
            optInputs.forEach(input => {
                const val = input.value.trim();
                if (val) options.push(val);
            });
        }

        questions.push({ text, type, options });
    });

    const payload = { title, description, questions };

    try {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Create survey request failed');
        
        showToast('Survey published successfully!');
        showView('dashboard');
    } catch (err) {
        console.error(err);
        showToast('Could not save survey.', 'error');
    }
}

// -------------------------------------------------------------
// SURVEY TAKER LOGIC (take.html)
// -------------------------------------------------------------
let currentSurveyId = null;

async function initSurveyTaker() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) {
        document.getElementById('survey-loading').innerHTML = `
            <i class="fa-solid fa-circle-exclamation loader-icon" style="color: var(--danger)"></i>
            <p>Invalid Survey Link.</p>
        `;
        return;
    }
    currentSurveyId = id;

    try {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) throw new Error('Survey not found');
        const survey = await response.json();

        document.getElementById('take-title').textContent = survey.title;
        document.getElementById('take-description').textContent = survey.description || '';
        document.title = `${survey.title} | FormCraft`;

        const container = document.getElementById('take-questions-container');
        container.innerHTML = '';

        survey.questions.forEach((q, index) => {
            const qDiv = document.createElement('div');
            qDiv.className = 'take-question-wrapper';
            qDiv.dataset.qid = q.id;
            qDiv.dataset.type = q.type;

            let inputHtml = '';
            if (q.type === 'TEXT') {
                inputHtml = `<textarea placeholder="Type your answer here..." rows="3" required class="answer-field"></textarea>`;
            } else if (q.type === 'MULTIPLE_CHOICE') {
                inputHtml = `<div class="choice-list">`;
                q.options.forEach((opt, oIdx) => {
                    inputHtml += `
                        <label class="choice-option">
                            <input type="radio" name="q_${q.id}" value="${escapeHTML(opt)}" required class="answer-field">
                            <span>${escapeHTML(opt)}</span>
                        </label>
                    `;
                });
                inputHtml += `</div>`;
            }

            qDiv.innerHTML = `
                <div class="take-question-title">
                    <span>${index + 1}.</span> ${escapeHTML(q.text)}
                </div>
                ${inputHtml}
            `;
            container.appendChild(qDiv);
        });

        document.getElementById('survey-loading').classList.add('hidden');
        document.getElementById('survey-content').classList.remove('hidden');

    } catch (error) {
        console.error(error);
        document.getElementById('survey-loading').innerHTML = `
            <i class="fa-solid fa-circle-exclamation loader-icon" style="color: var(--danger)"></i>
            <p>Could not load survey. It might have been deleted or the API is offline.</p>
        `;
    }
}

async function submitAnswers(event) {
    event.preventDefault();

    const questionWrappers = document.querySelectorAll('.take-question-wrapper');
    const answers = [];

    questionWrappers.forEach(wrapper => {
        const qId = wrapper.dataset.qid;
        const type = wrapper.dataset.type;
        let value = '';

        if (type === 'TEXT') {
            value = wrapper.querySelector('textarea').value.trim();
        } else if (type === 'MULTIPLE_CHOICE') {
            const checkedRadio = wrapper.querySelector('input[type="radio"]:checked');
            if (checkedRadio) value = checkedRadio.value;
        }

        answers.push({
            questionId: parseInt(qId),
            textValue: value
        });
    });

    const payload = {
        surveyId: parseInt(currentSurveyId),
        answers: answers
    };

    try {
        const res = await fetch(`${API_BASE}/${currentSurveyId}/responses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Response submission failed');

        document.getElementById('survey-content').classList.add('hidden');
        document.getElementById('success-state').classList.remove('hidden');

    } catch (err) {
        console.error(err);
        showToast('Error submitting response.', 'error');
    }
}

// -------------------------------------------------------------
// RESULTS ANALYTICS LOGIC (results.html)
// -------------------------------------------------------------

async function initSurveyResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) {
        document.getElementById('results-loading').innerHTML = `<p>Invalid parameters.</p>`;
        return;
    }

    try {
        // Fetch survey schema
        const surveyRes = await fetch(`${API_BASE}/${id}`);
        if (!surveyRes.ok) throw new Error('Survey not found');
        const survey = await surveyRes.json();

        document.getElementById('results-survey-title').textContent = `${survey.title} | Results`;
        document.getElementById('results-survey-desc').textContent = survey.description || 'No description';
        document.title = `${survey.title} - Analytics | FormCraft`;

        // Fetch submissions list
        const responseRes = await fetch(`${API_BASE}/${id}/responses`);
        if (!responseRes.ok) throw new Error('Failed to load answers');
        const responses = await responseRes.json();

        // Update counts
        document.getElementById('results-count').textContent = responses.length;

        const container = document.getElementById('results-content');
        container.innerHTML = '';

        if (responses.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 4rem; color: var(--text-muted);">
                    <i class="fa-solid fa-chart-line" style="font-size: 3rem; margin-bottom: 1.5rem; opacity: 0.6;"></i>
                    <h3>No responses recorded yet</h3>
                    <p>Share the survey link to gather analytics.</p>
                </div>
            `;
            document.getElementById('results-loading').classList.add('hidden');
            container.classList.remove('hidden');
            return;
        }

        // Map responses for fast analysis compiling
        // Create lookup Map for questions
        survey.questions.forEach((q, qIdx) => {
            const card = document.createElement('div');
            card.className = 'results-card';
            card.innerHTML = `
                <div class="results-card-title">
                    <span>Q${qIdx + 1}.</span> ${escapeHTML(q.text)}
                </div>
                <div id="q-stats-${q.id}"></div>
            `;
            container.appendChild(card);

            const statsDiv = card.querySelector(`#q-stats-${q.id}`);

            // Find all answers matching this question ID
            const matchingAnswers = [];
            responses.forEach(resp => {
                const ans = resp.answers.find(a => a.questionId === q.id);
                if (ans && ans.textValue) {
                    matchingAnswers.push(ans.textValue);
                }
            });

            if (q.type === 'MULTIPLE_CHOICE') {
                // Compute choice distributions
                const optionCounts = {};
                q.options.forEach(opt => optionCounts[opt] = 0);
                
                matchingAnswers.forEach(ans => {
                    if (optionCounts[ans] !== undefined) {
                        optionCounts[ans]++;
                    } else {
                        // Handle potential edge cases
                        optionCounts[ans] = 1;
                    }
                });

                let chartHtml = `<div class="bar-chart-container">`;
                q.options.forEach(opt => {
                    const count = optionCounts[opt] || 0;
                    const percent = matchingAnswers.length > 0 
                        ? Math.round((count / matchingAnswers.length) * 100) 
                        : 0;
                    
                    chartHtml += `
                        <div class="bar-row">
                            <div class="bar-labels">
                                <span>${escapeHTML(opt)}</span>
                                <span>${count} (${percent}%)</span>
                            </div>
                            <div class="bar-track">
                                <div class="bar-fill" style="width: ${percent}%;"></div>
                            </div>
                        </div>
                    `;
                });
                chartHtml += `</div>`;
                statsDiv.innerHTML = chartHtml;

            } else if (q.type === 'TEXT') {
                // List latest text statements
                let textHtml = `<div class="text-answers-list">`;
                if (matchingAnswers.length === 0) {
                    textHtml += `<p class="text-answer-empty">No text answers submitted yet.</p>`;
                } else {
                    matchingAnswers.forEach(ans => {
                        textHtml += `<div class="text-answer-item">${escapeHTML(ans)}</div>`;
                    });
                }
                textHtml += `</div>`;
                statsDiv.innerHTML = textHtml;
            }
        });

        document.getElementById('results-loading').classList.add('hidden');
        container.classList.remove('hidden');

    } catch (err) {
        console.error(err);
        document.getElementById('results-loading').innerHTML = `
            <i class="fa-solid fa-circle-exclamation loader-icon" style="color: var(--danger)"></i>
            <p>Failed to load survey analytics.</p>
        `;
    }
}

// Basic HTML sanitizer utility
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// -------------------------------------------------------------
// EVENT LISTENERS & INITS
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Determine view and handle buttons if on index.html
    const newSurveyBtn = document.getElementById('new-survey-btn');
    const sidebarNewBtn = document.getElementById('sidebar-new-btn');
    const loadDemoBtn = document.getElementById('load-demo-btn');
    
    if (newSurveyBtn) {
        newSurveyBtn.addEventListener('click', () => showView('creator'));
    }
    if (sidebarNewBtn) {
        sidebarNewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showView('creator');
        });
    }
    if (loadDemoBtn) {
        loadDemoBtn.addEventListener('click', loadDemoData);
    }

    // Auto-parse URL actions
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'new') {
        showView('creator');
    } else {
        showView('dashboard');
    }
});
