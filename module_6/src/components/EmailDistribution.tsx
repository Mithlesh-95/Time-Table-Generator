import React, { useState } from 'react';
import { Mail, Send, Users, Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { EmailConfig } from '../types';

const EmailDistribution: React.FC = () => {
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    recipients: [],
    subject: '',
    template: 'standard',
    attachments: [],
    scheduleType: 'immediate'
  });

  const [newRecipient, setNewRecipient] = useState('');
  const [emailGroups, setEmailGroups] = useState([
    {
      id: '1',
      name: 'All Faculty',
      recipients: ['sarah.johnson@college.edu', 'michael.chen@college.edu', 'emily.davis@college.edu'],
      type: 'faculty'
    },
    {
      id: '2',
      name: 'Computer Science Students',
      recipients: ['john.smith@student.edu', 'alice.brown@student.edu'],
      type: 'students'
    },
    {
      id: '3',
      name: 'Department Heads',
      recipients: ['head.cs@college.edu', 'head.ec@college.edu'],
      type: 'administration'
    }
  ]);

  const [scheduledEmails, setScheduledEmails] = useState([
    {
      id: '1',
      subject: 'Weekly Timetable Update',
      recipients: 15,
      scheduleType: 'weekly',
      nextSend: '2024-01-22 09:00:00',
      status: 'active'
    },
    {
      id: '2',
      subject: 'Faculty Schedule Changes',
      recipients: 8,
      scheduleType: 'immediate',
      nextSend: 'Sent',
      status: 'completed'
    }
  ]);

  const emailTemplates = [
    {
      id: 'standard',
      name: 'Standard Report',
      description: 'Professional template for general reports'
    },
    {
      id: 'urgent',
      name: 'Urgent Notice',
      description: 'High-priority template with emphasis'
    },
    {
      id: 'weekly',
      name: 'Weekly Summary',
      description: 'Template for regular weekly updates'
    },
    {
      id: 'custom',
      name: 'Custom Template',
      description: 'Customizable template for specific needs'
    }
  ];

  const addRecipient = () => {
    if (newRecipient && !emailConfig.recipients.includes(newRecipient)) {
      setEmailConfig({
        ...emailConfig,
        recipients: [...emailConfig.recipients, newRecipient]
      });
      setNewRecipient('');
    }
  };

  const removeRecipient = (email: string) => {
    setEmailConfig({
      ...emailConfig,
      recipients: emailConfig.recipients.filter(r => r !== email)
    });
  };

  const addGroup = (groupId: string) => {
    const group = emailGroups.find(g => g.id === groupId);
    if (group) {
      const newRecipients = group.recipients.filter(r => !emailConfig.recipients.includes(r));
      setEmailConfig({
        ...emailConfig,
        recipients: [...emailConfig.recipients, ...newRecipients]
      });
    }
  };

  const sendEmail = async () => {
    // Simulate email sending
    console.log('Sending email with config:', emailConfig);
    
    // Add to scheduled emails if it's a recurring schedule
    if (emailConfig.scheduleType !== 'immediate') {
      const newScheduledEmail = {
        id: Date.now().toString(),
        subject: emailConfig.subject,
        recipients: emailConfig.recipients.length,
        scheduleType: emailConfig.scheduleType,
        nextSend: 'Scheduled',
        status: 'active' as const
      };
      setScheduledEmails([newScheduledEmail, ...scheduledEmails]);
    }

    // Reset form
    setEmailConfig({
      recipients: [],
      subject: '',
      template: 'standard',
      attachments: [],
      scheduleType: 'immediate'
    });
  };

  return (
    <div className="space-y-6">
      {/* Email Composition */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Email Distribution</h2>

        {/* Recipients */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Recipients</h3>
          
          {/* Add Individual Recipient */}
          <div className="flex mb-4">
            <input
              type="email"
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
            />
            <button
              onClick={addRecipient}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Add Groups */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Quick Add Groups:</label>
            <div className="flex flex-wrap gap-2">
              {emailGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => addGroup(group.id)}
                  className="flex items-center space-x-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
                >
                  <Users className="h-3 w-3" />
                  <span>{group.name} ({group.recipients.length})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Recipients */}
          {emailConfig.recipients.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Current Recipients ({emailConfig.recipients.length}):
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                {emailConfig.recipients.map((email, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-700">{email}</span>
                    <button
                      onClick={() => removeRecipient(email)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Subject and Template */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Subject
            </label>
            <input
              type="text"
              value={emailConfig.subject}
              onChange={(e) => setEmailConfig({...emailConfig, subject: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email subject"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Template
            </label>
            <select
              value={emailConfig.template}
              onChange={(e) => setEmailConfig({...emailConfig, template: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {emailTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedule Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Schedule
          </label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {['immediate', 'daily', 'weekly', 'monthly'].map((type) => (
              <button
                key={type}
                onClick={() => setEmailConfig({...emailConfig, scheduleType: type as any})}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  emailConfig.scheduleType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Send Button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Ready to send to {emailConfig.recipients.length} recipients
            </p>
            {emailConfig.scheduleType !== 'immediate' && (
              <p className="text-xs text-blue-600">
                Will be sent {emailConfig.scheduleType}
              </p>
            )}
          </div>
          <button
            onClick={sendEmail}
            disabled={emailConfig.recipients.length === 0 || !emailConfig.subject}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
            <span>
              {emailConfig.scheduleType === 'immediate' ? 'Send Now' : 'Schedule Email'}
            </span>
          </button>
        </div>
      </div>

      {/* Recipient Groups Management */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recipient Groups</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emailGroups.map((group) => (
            <div key={group.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{group.name}</h4>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {group.type}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {group.recipients.length} recipients
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                {group.recipients.slice(0, 2).map((email, index) => (
                  <div key={index}>{email}</div>
                ))}
                {group.recipients.length > 2 && (
                  <div>+{group.recipients.length - 2} more...</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Emails */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Scheduled Emails</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Send
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scheduledEmails.map((email) => (
                <tr key={email.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{email.subject}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {email.recipients} recipients
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {email.scheduleType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {email.nextSend}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      email.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {email.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmailDistribution;