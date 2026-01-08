// --- استيراد Hooks من React ---
const { useState, useEffect, useCallback, useMemo } = React;

// --- البيانات الثابتة ---
// قائمة كليات جامعة الطائف
const COLLEGES = [
  { id: 'sharia', name: 'كلية الشريعة والأنظمة', departments: ['الدراسات الإسلامية', 'الشريعة', 'القانون'] },
  { id: 'arts', name: 'كلية الآداب', departments: ['اللغة العربية', 'اللغة الإنجليزية', 'التاريخ', 'الجغرافيا', 'علم المعلومات'] },
  { id: 'science', name: 'كلية العلوم', departments: ['الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء'] },
  { id: 'education', name: 'كلية التربية', departments: ['المناهج وطرق التدريس', 'علم النفس', 'التربية الخاصة', 'الطفولة المبكرة'] },
  { id: 'computers', name: 'كلية الحاسبات وتقنية المعلومات', departments: ['علوم الحاسب', 'تقنية المعلومات', 'نظم المعلومات'] },
  { id: 'engineering', name: 'كلية الهندسة', departments: ['الهندسة الكهربائية', 'الهندسة الميكانيكية', 'الهندسة المدنية', 'الهندسة الصناعية'] },
  { id: 'medicine', name: 'كلية الطب', departments: ['الطب البشري', 'الجراحة', 'طب الأطفال', 'طب النساء والتوليد'] },
  { id: 'pharmacy', name: 'كلية الصيدلة', departments: ['الصيدلة السريرية', 'الكيمياء الصيدلية', 'الصيدلانيات'] },
  { id: 'dentistry', name: 'كلية طب الأسنان', departments: ['طب الأسنان العام', 'تقويم الأسنان', 'جراحة الفم'] },
  { id: 'applied_medical', name: 'كلية العلوم الطبية التطبيقية', departments: ['المختبرات الطبية', 'التمريض', 'العلاج الطبيعي'] },
  { id: 'business', name: 'كلية إدارة الأعمال', departments: ['إدارة الأعمال', 'المحاسبة', 'التسويق', 'نظم المعلومات الإدارية'] },
  { id: 'design', name: 'كلية التصاميم والفنون التطبيقية', departments: ['التصميم الداخلي', 'التصميم الجرافيكي', 'الأزياء والنسيج'] },
  { id: 'home_economics', name: 'كلية الاقتصاد المنزلي', departments: ['التغذية وعلوم الأطعمة', 'إدارة السكن', 'الملابس والنسيج'] },
  { id: 'tourism', name: 'كلية السياحة والآثار', departments: ['الإدارة السياحية', 'الآثار', 'الإرشاد السياحي'] },
  { id: 'quran', name: 'كلية القرآن الكريم والدراسات الإسلامية', departments: ['القراءات', 'التفسير وعلوم القرآن', 'الدراسات القرآنية'] },
];

// أنواع التوصيفات
const SPEC_TYPES = [
  { id: 'program', name: 'توصيف برنامج', icon: '📋' },
  { id: 'course', name: 'توصيف مقرر', icon: '📝' },
];

// --- المكون الرئيسي ---
function SpecificationsSystem() {
  // حالات التطبيق
  const [activeTab, setActiveTab] = useState('home');
  const [specifications, setSpecifications] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCollege, setFilterCollege] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [alert, setAlert] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // نموذج الرفع
  const [formData, setFormData] = useState({
    type: 'course',
    college: '',
    department: '',
    name: '',
    version: new Date().getFullYear(),
    description: '',
    uploaderName: '',
    uploaderDepartment: '',
    pdfFile: null,
    wordFile: null,
  });

  // تحميل البيانات من Firebase
  useEffect(() => {
    // الاستماع للمصادقة
    auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
        localStorage.setItem('userId', user.uid);
      }
    });

    // تحميل التوصيفات
    const specsRef = database.ref('specifications');
    specsRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const specsArray = Object.entries(data).map(([id, spec]) => ({
          id,
          ...spec
        }));
        setSpecifications(specsArray.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setSpecifications([]);
      }
      setLoading(false);
    });

    // تحميل الأعضاء
    const membersRef = database.ref('members');
    membersRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const membersArray = Object.entries(data).map(([id, member]) => ({
          id,
          ...member
        }));
        setMembers(membersArray);
      }
    });

    return () => {
      specsRef.off();
      membersRef.off();
    };
  }, []);

  // إظهار التنبيه
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // رفع ملف إلى Firebase Storage
  const uploadFile = async (file, path) => {
    const storageRef = storage.ref(path);
    const uploadTask = storageRef.put(file);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => reject(error),
        async () => {
          const url = await uploadTask.snapshot.ref.getDownloadURL();
          resolve(url);
        }
      );
    });
  };

  // إرسال نموذج الرفع
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من البيانات
    if (!formData.college || !formData.department || !formData.name || 
        !formData.uploaderName || !formData.uploaderDepartment) {
      showAlert('error', 'الرجاء تعبئة جميع الحقول المطلوبة');
      return;
    }

    if (!formData.pdfFile && !formData.wordFile) {
      showAlert('error', 'الرجاء رفع ملف واحد على الأقل (PDF أو Word)');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const specId = `spec_${timestamp}`;
      let pdfUrl = null;
      let wordUrl = null;

      // رفع ملف PDF
      if (formData.pdfFile) {
        pdfUrl = await uploadFile(
          formData.pdfFile,
          `specifications/${specId}/document.pdf`
        );
      }

      // رفع ملف Word
      if (formData.wordFile) {
        wordUrl = await uploadFile(
          formData.wordFile,
          `specifications/${specId}/document.docx`
        );
      }

      // حفظ البيانات في قاعدة البيانات
      const specData = {
        type: formData.type,
        college: formData.college,
        department: formData.department,
        name: formData.name,
        version: formData.version,
        description: formData.description,
        uploaderName: formData.uploaderName,
        uploaderDepartment: formData.uploaderDepartment,
        uploaderId: currentUserId,
        pdfUrl,
        wordUrl,
        status: 'pending', // تحت المراجعة
        timestamp,
        dateCreated: new Date().toISOString(),
      };

      await database.ref(`specifications/${specId}`).set(specData);

      // تحديث إحصائيات العضو
      const memberRef = database.ref(`members/${currentUserId}`);
      const memberSnapshot = await memberRef.once('value');
      const memberData = memberSnapshot.val() || {
        name: formData.uploaderName,
        department: formData.uploaderDepartment,
        uploads: 0
      };
      
      await memberRef.set({
        ...memberData,
        name: formData.uploaderName,
        department: formData.uploaderDepartment,
        uploads: (memberData.uploads || 0) + 1,
        lastActivity: timestamp
      });

      // إعادة تعيين النموذج
      setFormData({
        type: 'course',
        college: '',
        department: '',
        name: '',
        version: new Date().getFullYear(),
        description: '',
        uploaderName: formData.uploaderName,
        uploaderDepartment: formData.uploaderDepartment,
        pdfFile: null,
        wordFile: null,
      });
      setShowUploadForm(false);
      showAlert('success', 'تم رفع التوصيف بنجاح! سيظهر بحالة "تحت المراجعة"');
    } catch (error) {
      console.error('Error uploading:', error);
      showAlert('error', 'حدث خطأ أثناء الرفع. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // حذف توصيف
  const handleDelete = async (spec) => {
    setConfirmModal({
      title: 'تأكيد الحذف',
      message: `هل أنت متأكد من حذف "${spec.name}"؟`,
      onConfirm: async () => {
        try {
          // حذف الملفات من Storage
          if (spec.pdfUrl) {
            await storage.refFromURL(spec.pdfUrl).delete().catch(() => {});
          }
          if (spec.wordUrl) {
            await storage.refFromURL(spec.wordUrl).delete().catch(() => {});
          }
          
          // حذف البيانات من Database
          await database.ref(`specifications/${spec.id}`).remove();
          
          // تحديث إحصائيات العضو
          const memberRef = database.ref(`members/${spec.uploaderId}`);
          const memberSnapshot = await memberRef.once('value');
          const memberData = memberSnapshot.val();
          if (memberData && memberData.uploads > 0) {
            await memberRef.update({ uploads: memberData.uploads - 1 });
          }
          
          showAlert('success', 'تم حذف التوصيف بنجاح');
        } catch (error) {
          console.error('Error deleting:', error);
          showAlert('error', 'حدث خطأ أثناء الحذف');
        }
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  // فلترة التوصيفات
  const filteredSpecs = useMemo(() => {
    return specifications.filter(spec => {
      const matchesSearch = searchQuery === '' || 
        spec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spec.college.includes(searchQuery) ||
        spec.department.includes(searchQuery) ||
        spec.uploaderName.includes(searchQuery);
      
      const matchesCollege = filterCollege === '' || spec.college === filterCollege;
      const matchesStatus = filterStatus === '' || spec.status === filterStatus;
      const matchesType = filterType === '' || spec.type === filterType;
      
      return matchesSearch && matchesCollege && matchesStatus && matchesType;
    });
  }, [specifications, searchQuery, filterCollege, filterStatus, filterType]);

  // إحصائيات
  const stats = useMemo(() => ({
    total: specifications.length,
    pending: specifications.filter(s => s.status === 'pending').length,
    confirmed: specifications.filter(s => s.status === 'confirmed').length,
    programs: specifications.filter(s => s.type === 'program').length,
    courses: specifications.filter(s => s.type === 'course').length,
  }), [specifications]);

  // الأعضاء الأكثر نشاطاً
  const topMembers = useMemo(() => {
    return [...members]
      .sort((a, b) => (b.uploads || 0) - (a.uploads || 0))
      .slice(0, 10);
  }, [members]);

  // آخر الأحداث
  const recentActivity = useMemo(() => {
    return [...specifications]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }, [specifications]);

  // الأقسام حسب الكلية المختارة
  const departments = useMemo(() => {
    if (!formData.college) return [];
    const college = COLLEGES.find(c => c.name === formData.college);
    return college ? college.departments : [];
  }, [formData.college]);

  // تنسيق التاريخ
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // تنسيق الوقت النسبي
  const getRelativeTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 30) return `منذ ${days} يوم`;
    return formatDate(timestamp);
  };

  // --- واجهة المستخدم ---
  return React.createElement('div', { className: 'app-container fade-in' },
    // التنبيهات
    alert && React.createElement('div', { className: `alert-box alert-${alert.type}` },
      React.createElement('span', null, 
        alert.type === 'success' ? '✅' : 
        alert.type === 'error' ? '❌' : 
        alert.type === 'warning' ? '⚠️' : 'ℹ️'
      ),
      React.createElement('span', null, alert.message)
    ),

    // رأس الصفحة
    React.createElement('header', { className: 'header' },
      React.createElement('div', { className: 'header-logo' }, '📚'),
      React.createElement('h1', null, 'نظام توصيفات البرامج والمقررات'),
      React.createElement('p', null, 'المنصة الإلكترونية لإدارة وأرشفة توصيفات البرامج والمقررات الأكاديمية'),
      React.createElement('div', { className: 'university-badge' },
        '🏛️',
        React.createElement('span', null, 'جامعة الطائف')
      )
    ),

    // شريط التنقل
    React.createElement('nav', { className: 'nav-tabs' },
      [
        { id: 'home', label: 'الرئيسية', icon: '🏠' },
        { id: 'browse', label: 'تصفح التوصيفات', icon: '📂', badge: stats.total },
        { id: 'upload', label: 'رفع توصيف', icon: '📤' },
        { id: 'activity', label: 'آخر الأحداث', icon: '📊' },
        { id: 'leaderboard', label: 'الأكثر نشاطاً', icon: '🏆' },
      ].map(tab =>
        React.createElement('button', {
          key: tab.id,
          className: `nav-tab ${activeTab === tab.id ? 'active' : ''}`,
          onClick: () => {
            setActiveTab(tab.id);
            if (tab.id === 'upload') setShowUploadForm(true);
          }
        },
          React.createElement('span', null, tab.icon),
          React.createElement('span', null, tab.label),
          tab.badge !== undefined && React.createElement('span', { className: 'badge' }, tab.badge)
        )
      )
    ),

    // --- محتوى الصفحة الرئيسية ---
    activeTab === 'home' && React.createElement('div', { className: 'fade-in' },
      // الإحصائيات
      React.createElement('div', { className: 'stats-grid' },
        [
          { icon: '📚', value: stats.total, label: 'إجمالي التوصيفات', color: 'blue' },
          { icon: '✅', value: stats.confirmed, label: 'مؤكد', color: 'green' },
          { icon: '⏳', value: stats.pending, label: 'تحت المراجعة', color: 'yellow' },
          { icon: '👥', value: members.length, label: 'الأعضاء المساهمون', color: 'purple' },
        ].map((stat, idx) =>
          React.createElement('div', { key: idx, className: 'stat-card' },
            React.createElement('div', { className: `stat-icon ${stat.color}` }, stat.icon),
            React.createElement('div', { className: 'stat-value' }, stat.value),
            React.createElement('div', { className: 'stat-label' }, stat.label)
          )
        )
      ),

      // قسمين جنب بعض
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' } },
        // آخر التوصيفات
        React.createElement('div', { className: 'card' },
          React.createElement('div', { className: 'card-header' },
            React.createElement('h3', { className: 'card-title' }, '📄 آخر التوصيفات المضافة'),
            React.createElement('button', { 
              className: 'btn btn-outline btn-sm',
              onClick: () => setActiveTab('browse')
            }, 'عرض الكل')
          ),
          recentActivity.slice(0, 5).map(spec =>
            React.createElement('div', { key: spec.id, className: 'activity-item' },
              React.createElement('div', { 
                className: `activity-icon ${spec.status === 'confirmed' ? 'confirm' : 'upload'}` 
              }, spec.type === 'program' ? '📋' : '📝'),
              React.createElement('div', { className: 'activity-content' },
                React.createElement('div', { className: 'activity-title' }, spec.name),
                React.createElement('div', { className: 'activity-meta' },
                  `${spec.college} - ${spec.department} • ${getRelativeTime(spec.timestamp)}`
                )
              ),
              React.createElement('span', { 
                className: `status-badge ${spec.status === 'confirmed' ? 'status-confirmed' : 'status-pending'}` 
              }, spec.status === 'confirmed' ? '✓ مؤكد' : '⏳ تحت المراجعة')
            )
          ),
          recentActivity.length === 0 && React.createElement('div', { className: 'empty-state' },
            React.createElement('div', { className: 'empty-state-icon' }, '📭'),
            React.createElement('div', null, 'لا توجد توصيفات بعد')
          )
        ),

        // الأكثر نشاطاً
        React.createElement('div', { className: 'leaderboard' },
          React.createElement('div', { className: 'leaderboard-header' },
            React.createElement('h3', null, '🏆 الأكثر نشاطاً')
          ),
          React.createElement('div', { className: 'leaderboard-list' },
            topMembers.slice(0, 5).map((member, idx) =>
              React.createElement('div', { key: member.id, className: 'leaderboard-item' },
                React.createElement('div', { 
                  className: `leaderboard-rank ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'normal'}` 
                }, idx + 1),
                React.createElement('div', { className: 'leaderboard-info' },
                  React.createElement('div', { className: 'leaderboard-name' }, member.name),
                  React.createElement('div', { className: 'leaderboard-dept' }, member.department)
                ),
                React.createElement('div', { className: 'leaderboard-count' }, 
                  `${member.uploads || 0} توصيف`
                )
              )
            ),
            topMembers.length === 0 && React.createElement('div', { 
              style: { textAlign: 'center', padding: '30px', color: '#666' } 
            }, 'لا يوجد أعضاء بعد')
          )
        )
      )
    ),

    // --- صفحة تصفح التوصيفات ---
    activeTab === 'browse' && React.createElement('div', { className: 'fade-in' },
      // صندوق البحث والفلترة
      React.createElement('div', { className: 'search-box' },
        React.createElement('div', { className: 'search-container' },
          React.createElement('div', { className: 'search-input-wrapper' },
            React.createElement('span', { className: 'search-icon' }, '🔍'),
            React.createElement('input', {
              type: 'text',
              className: 'search-input',
              placeholder: 'ابحث عن توصيف...',
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value)
            })
          ),
          React.createElement('select', {
            className: 'filter-select',
            value: filterCollege,
            onChange: (e) => setFilterCollege(e.target.value)
          },
            React.createElement('option', { value: '' }, 'جميع الكليات'),
            COLLEGES.map(college =>
              React.createElement('option', { key: college.id, value: college.name }, college.name)
            )
          ),
          React.createElement('select', {
            className: 'filter-select',
            value: filterType,
            onChange: (e) => setFilterType(e.target.value)
          },
            React.createElement('option', { value: '' }, 'جميع الأنواع'),
            SPEC_TYPES.map(type =>
              React.createElement('option', { key: type.id, value: type.id }, type.name)
            )
          ),
          React.createElement('select', {
            className: 'filter-select',
            value: filterStatus,
            onChange: (e) => setFilterStatus(e.target.value)
          },
            React.createElement('option', { value: '' }, 'جميع الحالات'),
            React.createElement('option', { value: 'confirmed' }, 'مؤكد'),
            React.createElement('option', { value: 'pending' }, 'تحت المراجعة')
          )
        )
      ),

      // نتائج البحث
      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'card-header' },
          React.createElement('h3', { className: 'card-title' }, 
            '📂 التوصيفات ',
            React.createElement('span', { style: { color: '#666', fontSize: '0.9em' } }, 
              `(${filteredSpecs.length} نتيجة)`
            )
          )
        ),
        
        filteredSpecs.length > 0 ? 
          React.createElement('div', { className: 'specs-grid' },
            filteredSpecs.map(spec =>
              React.createElement('div', { key: spec.id, className: 'spec-card' },
                React.createElement('div', { className: 'spec-card-header' },
                  React.createElement('div', { className: 'spec-card-status' },
                    React.createElement('span', { 
                      className: `status-badge ${spec.status === 'confirmed' ? 'status-confirmed' : 'status-pending'}` 
                    }, spec.status === 'confirmed' ? '✓ مؤكد' : '⏳ تحت المراجعة')
                  ),
                  React.createElement('div', { className: 'spec-card-type' },
                    spec.type === 'program' ? '📋 توصيف برنامج' : '📝 توصيف مقرر'
                  ),
                  React.createElement('div', { className: 'spec-card-title' }, spec.name),
                  React.createElement('div', { className: 'spec-card-meta' },
                    React.createElement('span', null, `🏛️ ${spec.college}`),
                    React.createElement('span', null, `📅 ${spec.version}`)
                  )
                ),
                React.createElement('div', { className: 'spec-card-body' },
                  React.createElement('div', { className: 'spec-info-grid' },
                    React.createElement('div', { className: 'spec-info-item' },
                      React.createElement('span', { className: 'spec-info-label' }, 'القسم'),
                      React.createElement('span', { className: 'spec-info-value' }, spec.department)
                    ),
                    React.createElement('div', { className: 'spec-info-item' },
                      React.createElement('span', { className: 'spec-info-label' }, 'تم الرفع بواسطة'),
                      React.createElement('span', { className: 'spec-info-value' }, spec.uploaderName)
                    ),
                    React.createElement('div', { className: 'spec-info-item' },
                      React.createElement('span', { className: 'spec-info-label' }, 'قسم العضو'),
                      React.createElement('span', { className: 'spec-info-value' }, spec.uploaderDepartment)
                    ),
                    React.createElement('div', { className: 'spec-info-item' },
                      React.createElement('span', { className: 'spec-info-label' }, 'تاريخ الرفع'),
                      React.createElement('span', { className: 'spec-info-value' }, formatDate(spec.timestamp))
                    )
                  ),
                  spec.description && React.createElement('p', { 
                    style: { color: '#666', fontSize: '0.9em', marginBottom: '15px' } 
                  }, spec.description),
                  React.createElement('div', { className: 'spec-card-actions' },
                    spec.pdfUrl && React.createElement('a', {
                      href: spec.pdfUrl,
                      target: '_blank',
                      className: 'btn btn-primary btn-sm'
                    }, '📄 PDF'),
                    spec.wordUrl && React.createElement('a', {
                      href: spec.wordUrl,
                      target: '_blank',
                      className: 'btn btn-outline btn-sm'
                    }, '📝 Word'),
                    (spec.uploaderId === currentUserId) && React.createElement('button', {
                      className: 'btn btn-danger btn-sm',
                      onClick: () => handleDelete(spec)
                    }, '🗑️ حذف')
                  )
                )
              )
            )
          ) :
          React.createElement('div', { className: 'empty-state' },
            React.createElement('div', { className: 'empty-state-icon' }, '🔍'),
            React.createElement('div', { className: 'empty-state-title' }, 'لا توجد نتائج'),
            React.createElement('p', null, 'جرب تغيير معايير البحث')
          )
      )
    ),

    // --- صفحة رفع توصيف ---
    activeTab === 'upload' && React.createElement('div', { className: 'fade-in' },
      React.createElement('div', { className: 'upload-form' },
        React.createElement('div', { className: 'card-header' },
          React.createElement('h3', { className: 'card-title' }, '📤 رفع توصيف جديد')
        ),
        
        React.createElement('form', { onSubmit: handleSubmit },
          React.createElement('div', { className: 'form-grid' },
            // نوع التوصيف
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 
                'نوع التوصيف ',
                React.createElement('span', { className: 'required' }, '*')
              ),
              React.createElement('select', {
                className: 'form-select',
                value: formData.type,
                onChange: (e) => setFormData({...formData, type: e.target.value})
              },
                SPEC_TYPES.map(type =>
                  React.createElement('option', { key: type.id, value: type.id }, 
                    `${type.icon} ${type.name}`
                  )
                )
              )
            ),

            // الكلية
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 
                'الكلية ',
                React.createElement('span', { className: 'required' }, '*')
              ),
              React.createElement('select', {
                className: 'form-select',
                value: formData.college,
                onChange: (e) => setFormData({...formData, college: e.target.value, department: ''})
              },
                React.createElement('option', { value: '' }, 'اختر الكلية'),
                COLLEGES.map(college =>
                  React.createElement('option', { key: college.id, value: college.name }, college.name)
                )
              )
            ),

            // القسم
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 
                'القسم ',
                React.createElement('span', { className: 'required' }, '*')
              ),
              React.createElement('select', {
                className: 'form-select',
                value: formData.department,
                onChange: (e) => setFormData({...formData, department: e.target.value}),
                disabled: !formData.college
              },
                React.createElement('option', { value: '' }, 'اختر القسم'),
                departments.map(dept =>
                  React.createElement('option', { key: dept, value: dept }, dept)
                )
              )
            ),

            // اسم التوصيف
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 
                formData.type === 'program' ? 'اسم البرنامج' : 'اسم المقرر',
                React.createElement('span', { className: 'required' }, ' *')
              ),
              React.createElement('input', {
                type: 'text',
                className: 'form-input',
                placeholder: formData.type === 'program' ? 'مثال: بكالوريوس علوم الحاسب' : 'مثال: مقدمة في البرمجة',
                value: formData.name,
                onChange: (e) => setFormData({...formData, name: e.target.value})
              })
            ),

            // الإصدار/السنة
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'سنة الإصدار'),
              React.createElement('input', {
                type: 'number',
                className: 'form-input',
                min: '2000',
                max: '2030',
                value: formData.version,
                onChange: (e) => setFormData({...formData, version: e.target.value})
              })
            ),

            // اسم العضو
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 
                'اسم العضو الرافع ',
                React.createElement('span', { className: 'required' }, '*')
              ),
              React.createElement('input', {
                type: 'text',
                className: 'form-input',
                placeholder: 'اسمك الكامل',
                value: formData.uploaderName,
                onChange: (e) => setFormData({...formData, uploaderName: e.target.value})
              })
            ),

            // قسم العضو
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 
                'قسم العضو الرافع ',
                React.createElement('span', { className: 'required' }, '*')
              ),
              React.createElement('input', {
                type: 'text',
                className: 'form-input',
                placeholder: 'القسم الذي تنتمي إليه',
                value: formData.uploaderDepartment,
                onChange: (e) => setFormData({...formData, uploaderDepartment: e.target.value})
              })
            )
          ),

          // الوصف
          React.createElement('div', { className: 'form-group', style: { marginBottom: '25px' } },
            React.createElement('label', { className: 'form-label' }, 'وصف إضافي (اختياري)'),
            React.createElement('textarea', {
              className: 'form-textarea',
              placeholder: 'أي ملاحظات أو وصف إضافي...',
              value: formData.description,
              onChange: (e) => setFormData({...formData, description: e.target.value})
            })
          ),

          // رفع الملفات
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '25px' } },
            // ملف PDF
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, '📄 ملف PDF'),
              React.createElement('div', { 
                className: 'file-upload-zone',
                onClick: () => document.getElementById('pdf-input').click()
              },
                React.createElement('div', { className: 'file-upload-icon' }, '📄'),
                formData.pdfFile ? 
                  React.createElement('div', null,
                    React.createElement('div', { className: 'file-upload-text' }, formData.pdfFile.name),
                    React.createElement('button', {
                      type: 'button',
                      className: 'btn btn-danger btn-sm',
                      style: { marginTop: '10px' },
                      onClick: (e) => { e.stopPropagation(); setFormData({...formData, pdfFile: null}); }
                    }, 'إزالة')
                  ) :
                  React.createElement('div', null,
                    React.createElement('div', { className: 'file-upload-text' }, 'اضغط لرفع ملف PDF'),
                    React.createElement('div', { className: 'file-upload-hint' }, 'الحد الأقصى: 10 MB')
                  )
              ),
              React.createElement('input', {
                type: 'file',
                id: 'pdf-input',
                accept: '.pdf',
                style: { display: 'none' },
                onChange: (e) => setFormData({...formData, pdfFile: e.target.files[0]})
              })
            ),

            // ملف Word
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, '📝 ملف Word'),
              React.createElement('div', { 
                className: 'file-upload-zone',
                onClick: () => document.getElementById('word-input').click()
              },
                React.createElement('div', { className: 'file-upload-icon' }, '📝'),
                formData.wordFile ? 
                  React.createElement('div', null,
                    React.createElement('div', { className: 'file-upload-text' }, formData.wordFile.name),
                    React.createElement('button', {
                      type: 'button',
                      className: 'btn btn-danger btn-sm',
                      style: { marginTop: '10px' },
                      onClick: (e) => { e.stopPropagation(); setFormData({...formData, wordFile: null}); }
                    }, 'إزالة')
                  ) :
                  React.createElement('div', null,
                    React.createElement('div', { className: 'file-upload-text' }, 'اضغط لرفع ملف Word'),
                    React.createElement('div', { className: 'file-upload-hint' }, '.doc, .docx - الحد الأقصى: 10 MB')
                  )
              ),
              React.createElement('input', {
                type: 'file',
                id: 'word-input',
                accept: '.doc,.docx',
                style: { display: 'none' },
                onChange: (e) => setFormData({...formData, wordFile: e.target.files[0]})
              })
            )
          ),

          // شريط التقدم
          uploadProgress > 0 && React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('div', { className: 'progress-bar' },
              React.createElement('div', { 
                className: 'progress-bar-fill',
                style: { width: `${uploadProgress}%` }
              })
            ),
            React.createElement('div', { style: { textAlign: 'center', color: '#666' } },
              `جاري الرفع... ${Math.round(uploadProgress)}%`
            )
          ),

          // زر الإرسال
          React.createElement('div', { style: { textAlign: 'center' } },
            React.createElement('button', {
              type: 'submit',
              className: 'btn btn-primary',
              disabled: loading,
              style: { minWidth: '200px' }
            }, loading ? 'جاري الرفع...' : '📤 رفع التوصيف')
          ),

          // ملاحظة
          React.createElement('div', { 
            className: 'alert-box alert-info',
            style: { marginTop: '20px' }
          },
            React.createElement('span', null, 'ℹ️'),
            React.createElement('span', null, 'سيظهر التوصيف بحالة "تحت المراجعة" حتى يتم تأكيده من قبل المشرف')
          )
        )
      )
    ),

    // --- صفحة آخر الأحداث ---
    activeTab === 'activity' && React.createElement('div', { className: 'fade-in' },
      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'card-header' },
          React.createElement('h3', { className: 'card-title' }, '📊 آخر الأحداث')
        ),
        React.createElement('div', { className: 'activity-list' },
          recentActivity.map(spec =>
            React.createElement('div', { key: spec.id, className: 'activity-item slide-in' },
              React.createElement('div', { 
                className: `activity-icon ${spec.status === 'confirmed' ? 'confirm' : 'upload'}` 
              }, spec.type === 'program' ? '📋' : '📝'),
              React.createElement('div', { className: 'activity-content' },
                React.createElement('div', { className: 'activity-title' },
                  spec.status === 'confirmed' ? 'تم تأكيد: ' : 'تم رفع: ',
                  spec.name
                ),
                React.createElement('div', { className: 'activity-meta' },
                  `${spec.college} - ${spec.department}`
                ),
                React.createElement('div', { className: 'activity-meta' },
                  `بواسطة: ${spec.uploaderName} • ${getRelativeTime(spec.timestamp)}`
                )
              ),
              React.createElement('span', { 
                className: `status-badge ${spec.status === 'confirmed' ? 'status-confirmed' : 'status-pending'}` 
              }, spec.status === 'confirmed' ? '✓ مؤكد' : '⏳ تحت المراجعة')
            )
          ),
          recentActivity.length === 0 && React.createElement('div', { className: 'empty-state' },
            React.createElement('div', { className: 'empty-state-icon' }, '📭'),
            React.createElement('div', { className: 'empty-state-title' }, 'لا توجد أحداث بعد'),
            React.createElement('p', null, 'ابدأ برفع أول توصيف!')
          )
        )
      )
    ),

    // --- صفحة الأكثر نشاطاً ---
    activeTab === 'leaderboard' && React.createElement('div', { className: 'fade-in' },
      React.createElement('div', { className: 'leaderboard', style: { maxWidth: '600px', margin: '0 auto' } },
        React.createElement('div', { className: 'leaderboard-header' },
          React.createElement('h2', null, '🏆 قائمة الأكثر نشاطاً'),
          React.createElement('p', { style: { opacity: 0.8, marginTop: '5px' } }, 
            'الأعضاء الأكثر مساهمة في رفع التوصيفات'
          )
        ),
        React.createElement('div', { className: 'leaderboard-list' },
          topMembers.map((member, idx) =>
            React.createElement('div', { key: member.id, className: 'leaderboard-item' },
              React.createElement('div', { 
                className: `leaderboard-rank ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'normal'}` 
              }, idx + 1),
              React.createElement('div', { className: 'leaderboard-info' },
                React.createElement('div', { className: 'leaderboard-name' }, member.name),
                React.createElement('div', { className: 'leaderboard-dept' }, member.department)
              ),
              React.createElement('div', { className: 'leaderboard-count' }, 
                `${member.uploads || 0} توصيف`
              )
            )
          ),
          topMembers.length === 0 && React.createElement('div', { 
            style: { textAlign: 'center', padding: '40px', color: '#666' } 
          },
            React.createElement('div', { style: { fontSize: '3em', marginBottom: '15px' } }, '👥'),
            React.createElement('div', null, 'لا يوجد أعضاء بعد'),
            React.createElement('div', { style: { fontSize: '0.9em', marginTop: '5px' } }, 
              'كن أول من يرفع توصيفاً!'
            )
          )
        )
      )
    ),

    // نافذة التأكيد
    confirmModal && React.createElement('div', { className: 'confirm-modal' },
      React.createElement('div', { className: 'confirm-modal-content' },
        React.createElement('div', { className: 'confirm-modal-icon' }, '⚠️'),
        React.createElement('div', { className: 'confirm-modal-title' }, confirmModal.title),
        React.createElement('div', { className: 'confirm-modal-text' }, confirmModal.message),
        React.createElement('div', { className: 'confirm-modal-actions' },
          React.createElement('button', {
            className: 'btn btn-outline',
            onClick: confirmModal.onCancel
          }, 'إلغاء'),
          React.createElement('button', {
            className: 'btn btn-danger',
            onClick: confirmModal.onConfirm
          }, 'تأكيد الحذف')
        )
      )
    ),

    // التذييل
    React.createElement('footer', { className: 'footer' },
      React.createElement('p', null, 
        '© ', new Date().getFullYear(), ' نظام توصيفات البرامج والمقررات - ',
        React.createElement('a', { href: 'https://www.tu.edu.sa', target: '_blank' }, 'جامعة الطائف')
      ),
      React.createElement('p', { style: { fontSize: '0.9em', marginTop: '5px' } }, 
        'تم التطوير لتسهيل إدارة وأرشفة التوصيفات الأكاديمية'
      )
    )
  );
}

// --- تشغيل التطبيق ---
try {
  const rootEl = document.getElementById('root');
  if (rootEl && ReactDOM?.createRoot) {
    ReactDOM.createRoot(rootEl).render(React.createElement(SpecificationsSystem));
  } else if (rootEl) {
    ReactDOM.render(React.createElement(SpecificationsSystem), rootEl);
  }
} catch (err) {
  console.error('Error initializing app:', err);
  document.body.innerHTML =
    '<div style="padding:24px; font-family:sans-serif; direction:rtl; text-align:center">' +
    '<h2>حدث خطأ في تحميل التطبيق</h2><p>الرجاء تحديث الصفحة</p></div>';
}
