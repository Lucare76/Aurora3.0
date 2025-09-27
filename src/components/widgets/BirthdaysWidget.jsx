import { useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, Gift, Mail, RefreshCw, AtSign } from 'lucide-react';
import { useBirthdays } from '../../contexts/BirthdaysContext';
import { useWidgetSettings } from '../../contexts/WidgetSettingsContext';
import useBirthdayReminders from '../../hooks/useBirthdayReminders';

const BirthdaysWidget = () => {
  const { birthdays, addBirthday, updateBirthday, deleteBirthday } = useBirthdays();
  const { settings } = useWidgetSettings();
  const { getUpcomingBirthdays, calculateDaysUntilBirthday } = useBirthdayReminders();
  const [showForm, setShowForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState(null);
  const [editingEmail, setEditingEmail] = useState(null);
  const [formData, setFormData] = useState({ name: '', birthday: '', email: '' });
  const [emailData, setEmailData] = useState('');

  // Don't render if widget is disabled
  if (!settings.birthdays.enabled) {
    return null;
  }

  const upcomingBirthdays = getUpcomingBirthdays();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.birthday) return;

    if (editingBirthday) {
      updateBirthday(editingBirthday.id, formData);
    } else {
      addBirthday(formData);
    }

    setFormData({ name: '', birthday: '', email: '' });
    setEditingBirthday(null);
    setShowForm(false);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (editingEmail) {
      updateBirthday(editingEmail.id, { ...editingEmail, email: emailData });
      setEditingEmail(null);
      setEmailData('');
      setShowEmailForm(false);
    }
  };

  const handleEdit = (birthday) => {
    setEditingBirthday(birthday);
    setFormData({
      name: birthday.name,
      birthday: birthday.birthday,
      email: birthday.email || ''
    });
    setShowForm(true);
  };

  const handleEditEmail = (birthday) => {
    setEditingEmail(birthday);
    setEmailData(birthday.email || '');
    setShowEmailForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo compleanno?')) {
      deleteBirthday(id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long'
    });
  };

  const getBirthdayIcon = (daysUntil) => {
    if (daysUntil === 0) return '🎂';
    if (daysUntil <= 7) return '🎉';
    return '🎈';
  };

  return (
    <div className="aurora-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Compleanni</h3>
        <div className="flex gap-2">
          {upcomingBirthdays.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
              <Mail className="h-3 w-3" />
              <span>Reminder attivi</span>
            </div>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="p-1 text-pink-500 hover:text-pink-700 transition-colors"
            title="Aggiungi Compleanno"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Upcoming Birthdays Alert */}
      {upcomingBirthdays.length > 0 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-4 w-4 text-pink-600" />
            <span className="text-sm font-medium text-pink-800">Compleanni in arrivo!</span>
          </div>
          {upcomingBirthdays.map(person => (
            <div key={person.id} className="flex items-center justify-between text-sm">
              <span className="text-pink-700">
                {getBirthdayIcon(person.daysUntil)} {person.name}
              </span>
              <span className="text-pink-600 font-medium">
                {person.daysUntil === 0 ? 'Oggi!' : `${person.daysUntil} giorni`}
              </span>
            </div>
          ))}
          <div className="mt-2 text-xs text-pink-600">
            📧 Email reminder automatici attivi (7gg e 2gg prima)
          </div>
        </div>
      )}

      {/* Birthdays List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {birthdays.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">Nessun compleanno salvato</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
            >
              Aggiungi il primo compleanno
            </button>
          </div>
        ) : (
          birthdays.map(birthday => {
            const daysUntil = calculateDaysUntilBirthday(birthday.birthday);
            return (
              <div key={birthday.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getBirthdayIcon(daysUntil)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{birthday.name}</div>
                    <div className="text-sm text-gray-600">
                      {formatDate(birthday.birthday)}
                      {daysUntil <= 30 && (
                        <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs">
                          {daysUntil === 0 ? 'Oggi!' : `${daysUntil} giorni`}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {birthday.email ? (
                        <span className="text-blue-600">{birthday.email}</span>
                      ) : (
                        <span className="text-gray-400 italic">Nessuna email</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditEmail(birthday)}
                    className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                    title="Modifica Email"
                  >
                    <AtSign className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(birthday)}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Modifica"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(birthday.id)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    title="Elimina"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingBirthday ? 'Modifica Compleanno' : 'Aggiungi Compleanno'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                  placeholder="Nome della persona"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data di Nascita *
                </label>
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (opzionale)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="email@esempio.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  📧 Per ricevere reminder automatici via email
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  {editingBirthday ? 'Salva Modifiche' : 'Aggiungi'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBirthday(null);
                    setFormData({ name: '', birthday: '', email: '' });
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Edit Modal */}
      {showEmailForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AtSign className="h-5 w-5 text-green-600" />
              Modifica Email - {editingEmail?.name}
            </h3>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email per Reminder
                </label>
                <input
                  type="email"
                  value={emailData}
                  onChange={(e) => setEmailData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="email@esempio.com"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  📧 Lascia vuoto per disabilitare i reminder email
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Salva Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm(false);
                    setEditingEmail(null);
                    setEmailData('');
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BirthdaysWidget;