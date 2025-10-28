import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Loader2 } from 'lucide-react';
import { usePublicData } from '../hooks/publicQueries';

const Footer: React.FC = () => {
    const { data, isLoading } = usePublicData();
    const socialLinks = data?.socialLinks;
    const siteContent = data?.siteContent;

    return (
        <footer className="bg-gray-800 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">منصة الرحلة</h3>
                        <p className="text-gray-400 text-sm">
                            {siteContent?.aboutPage.missionStatement || "نؤمن أن كل طفل هو بطل حكايته الخاصة. لذلك نصنع بحب وإتقان قصصاً ومنتجات تربوية مخصصة تماماً، تكون مرآة تعكس شخصية الطفل الفريدة، وتعزز هويته العربية، وتغرس في قلبه أسمى القيم الإنسانية."}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/about" className="text-gray-400 hover:text-white">عنا</Link></li>
                            <li><Link to="/blog" className="text-gray-400 hover:text-white">المدونة</Link></li>
                            <li><Link to="/support" className="text-gray-400 hover:text-white">الدعم</Link></li>
                            <li><Link to="/join-us" className="text-gray-400 hover:text-white">انضم إلينا</Link></li>
                        </ul>
                    </div>
                    
                    {/* Projects */}
                     <div>
                        <h3 className="text-lg font-bold mb-4">أقسامنا</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/enha-lak/store" className="text-gray-400 hover:text-white">قصص "إنها لك"</Link></li>
                            <li><Link to="/creative-writing" className="text-gray-400 hover:text-white">برنامج "بداية الرحلة"</Link></li>
                            <li><Link to="/enha-lak/subscription" className="text-gray-400 hover:text-white">صندوق الرحلة الشهري</Link></li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">تابعنا</h3>
                        {isLoading ? <Loader2 className="animate-spin" /> : (
                            <div className="flex space-x-4 rtl:space-x-reverse">
                                {socialLinks?.facebook_url && <a href={socialLinks.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><Facebook /></a>}
                                {socialLinks?.twitter_url && <a href={socialLinks.twitter_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><Twitter /></a>}
                                {socialLinks?.instagram_url && <a href={socialLinks.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><Instagram /></a>}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} منصة الرحلة. جميع الحقوق محفوظة.</p>
                    <div className="flex space-x-4 rtl:space-x-reverse mt-4 sm:mt-0">
                        <Link to="/privacy" className="hover:text-white">سياسة الخصوصية</Link>
                        <Link to="/terms" className="hover:text-white">شروط الاستخدام</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default React.memo(Footer);