var config = {};

config.jira = {
    baseUrl: 'https://jira.ydp.eu/',
    login: 'user',
    password: 'password'
};

config.worklog = {};

config.worklog.dateFrom = new Date(2013, 0, 1);
config.worklog.dateTo = new Date(2013, 5, 1);
config.worklog.projects = {
    'YA5M': 'project = PSS',
    '3861': 'project = AMS'
};


module.exports = config;
