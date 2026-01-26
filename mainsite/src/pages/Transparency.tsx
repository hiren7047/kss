import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Receipt, 
  FileText, 
  Calendar,
  Filter,
  Loader2,
  Eye,
  IndianRupee,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { publicApi } from '@/lib/api';

const Transparency = () => {
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';
  
  const [donationPage, setDonationPage] = useState(1);
  const [expensePage, setExpensePage] = useState(1);
  const [donationFilter, setDonationFilter] = useState<string>('all');
  const [expenseFilter, setExpenseFilter] = useState<string>('all');
  const limit = 10;

  // Fetch transparency summary
  const { data: summaryData, isLoading: summaryLoading, isError: summaryError } = useQuery({
    queryKey: ['transparencySummary'],
    queryFn: () => publicApi.getTransparencySummary(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });

  // Fetch donations
  const { data: donationsData, isLoading: donationsLoading } = useQuery({
    queryKey: ['transparencyDonations', donationPage, donationFilter],
    queryFn: () => publicApi.getTransparencyDonations({
      page: donationPage,
      limit,
      ...(donationFilter !== 'all' && { purpose: donationFilter })
    }),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  // Fetch expenses
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['transparencyExpenses', expensePage, expenseFilter],
    queryFn: () => publicApi.getTransparencyExpenses({
      page: expensePage,
      limit,
      ...(expenseFilter !== 'all' && { category: expenseFilter })
    }),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const wallet = summaryData?.data?.wallet;
  const statistics = summaryData?.data?.statistics;
  const trends = summaryData?.data?.trends;
  const donations = donationsData?.data || [];
  const expenses = expensesData?.data || [];
  const donationsPagination = donationsData?.pagination;
  const expensesPagination = expensesData?.pagination;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPurposeLabel = (purpose: string) => {
    const labels: Record<string, string> = {
      general: t('transparency.general'),
      event: t('transparency.event'),
      emergency: t('transparency.emergency'),
    };
    return labels[purpose] || purpose;
  };

  const getPaymentModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      upi: t('transparency.upi'),
      cash: t('transparency.cash'),
      bank: t('transparency.bank'),
      razorpay: t('transparency.razorpay'),
    };
    return labels[mode] || mode;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <p className="text-primary font-serif text-lg mb-4 lang-hi">
              ॥ {t('transparency.heroQuote')} ॥
            </p>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6 ${langClass}`}>
              {t('transparency.heroTitle')}
            </h1>
            <p className={`text-xl text-foreground/80 mb-4 ${langClass}`}>
              {t('transparency.heroSubtitle')}
            </p>
            <p className={`text-lg text-foreground/70 max-w-2xl mx-auto ${langClass}`}>
              {t('transparency.description')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Wallet Summary */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <SectionTitle
            title={t('transparency.walletTitle')}
            subtitle={t('transparency.walletSubtitle')}
          />

          {summaryLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : summaryError || !wallet ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
              <p className={`text-foreground/60 ${langClass}`}>{t('transparency.error')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-6 border border-green-500/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <Wallet className="w-8 h-8 text-green-600" />
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h3 className={`text-sm font-medium text-foreground/70 mb-2 ${langClass}`}>
                  {t('transparency.availableBalance')}
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(wallet.availableBalance)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-6 border border-blue-500/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className={`text-sm font-medium text-foreground/70 mb-2 ${langClass}`}>
                  {t('transparency.totalDonations')}
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(wallet.totalDonations)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-xl p-6 border border-orange-500/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <Receipt className="w-8 h-8 text-orange-600" />
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className={`text-sm font-medium text-foreground/70 mb-2 ${langClass}`}>
                  {t('transparency.totalExpenses')}
                </h3>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(wallet.totalExpenses)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-6 border border-purple-500/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 text-purple-600" />
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className={`text-sm font-medium text-foreground/70 mb-2 ${langClass}`}>
                  {t('transparency.restrictedFunds')}
                </h3>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(wallet.restrictedFunds)}
                </p>
              </motion.div>
            </div>
          )}

          {wallet && (
            <div className="mt-6 text-center">
              <p className={`text-sm text-foreground/60 ${langClass}`}>
                {t('transparency.lastUpdated')}: {formatDate(wallet.lastUpdated)}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Donations Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className={`text-3xl font-serif font-bold text-foreground mb-2 ${langClass}`}>
                {t('transparency.donationsTitle')}
              </h2>
              <p className={`text-foreground/70 ${langClass}`}>
                {t('transparency.donationsSubtitle')}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <Filter className="w-4 h-4 text-foreground/60" />
              <select
                value={donationFilter}
                onChange={(e) => {
                  setDonationFilter(e.target.value);
                  setDonationPage(1);
                }}
                className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="all">{t('transparency.all')}</option>
                <option value="general">{t('transparency.general')}</option>
                <option value="event">{t('transparency.event')}</option>
                <option value="emergency">{t('transparency.emergency')}</option>
              </select>
            </div>
          </div>

          {donationsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl">
              <Receipt className="w-12 h-12 mx-auto text-foreground/40 mb-4" />
              <p className={`text-foreground/60 ${langClass}`}>{t('transparency.noDonations')}</p>
            </div>
          ) : (
            <>
              <div className="bg-card rounded-xl overflow-hidden border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary/5">
                      <tr>
                        <th className={`px-6 py-4 text-left text-sm font-semibold text-foreground ${langClass}`}>
                          {t('transparency.donorName')}
                        </th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold text-foreground ${langClass}`}>
                          {t('transparency.amount')}
                        </th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold text-foreground ${langClass}`}>
                          {t('transparency.purpose')}
                        </th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold text-foreground ${langClass}`}>
                          {t('transparency.paymentMode')}
                        </th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold text-foreground ${langClass}`}>
                          {t('transparency.date')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {donations.map((donation: any, index: number) => (
                        <motion.tr
                          key={donation.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-primary/5 transition-colors"
                        >
                          <td className={`px-6 py-4 ${langClass}`}>
                            <div className="flex items-center gap-2">
                              {donation.isAnonymous ? (
                                <span className="text-foreground/60 italic">{t('transparency.anonymous')}</span>
                              ) : (
                                <span className="font-medium">{donation.donorName}</span>
                              )}
                            </div>
                          </td>
                          <td className={`px-6 py-4 font-semibold text-green-600 ${langClass}`}>
                            {formatCurrency(donation.amount)}
                          </td>
                          <td className={`px-6 py-4 ${langClass}`}>
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                              {getPurposeLabel(donation.purpose)}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-foreground/70 ${langClass}`}>
                            {getPaymentModeLabel(donation.paymentMode)}
                          </td>
                          <td className={`px-6 py-4 text-foreground/70 ${langClass}`}>
                            {formatDate(donation.date)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {donationsPagination && donationsPagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setDonationPage(p => Math.max(1, p - 1))}
                    disabled={donationPage === 1}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('transparency.previous')}
                  </Button>
                  <span className={`text-foreground/70 ${langClass}`}>
                    {t('transparency.page')} {donationPage} {t('transparency.of')} {donationsPagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setDonationPage(p => Math.min(donationsPagination.totalPages, p + 1))}
                    disabled={donationPage >= donationsPagination.totalPages}
                  >
                    {t('transparency.next')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Expenses Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className={`text-3xl font-serif font-bold text-foreground mb-2 ${langClass}`}>
                {t('transparency.expensesTitle')}
              </h2>
              <p className={`text-foreground/70 ${langClass}`}>
                {t('transparency.expensesSubtitle')}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <Filter className="w-4 h-4 text-foreground/60" />
              <select
                value={expenseFilter}
                onChange={(e) => {
                  setExpenseFilter(e.target.value);
                  setExpensePage(1);
                }}
                className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="all">{t('transparency.all')}</option>
                {/* Categories will be dynamic based on actual data */}
              </select>
            </div>
          </div>

          {expensesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12 bg-background rounded-xl">
              <FileText className="w-12 h-12 mx-auto text-foreground/40 mb-4" />
              <p className={`text-foreground/60 ${langClass}`}>{t('transparency.noExpenses')}</p>
            </div>
          ) : (
            <>
              <div className="bg-background rounded-xl overflow-hidden border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary/5">
                      <tr>
                        <th className={`px-6 py-4 text-left text-sm font-semibold text-foreground ${langClass}`}>
                          {t('transparency.expenseTitle')}
                        </th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold text-foreground ${langClass}`}>
                          {t('transparency.category')}
                        </th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold text-foreground ${langClass}`}>
                          {t('transparency.amount')}
                        </th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold text-foreground ${langClass}`}>
                          {t('transparency.approvedBy')}
                        </th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold text-foreground ${langClass}`}>
                          {t('transparency.date')}
                        </th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold text-foreground ${langClass}`}>
                          {t('transparency.bill')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {expenses.map((expense: any, index: number) => (
                        <motion.tr
                          key={expense.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-primary/5 transition-colors"
                        >
                          <td className={`px-6 py-4 font-medium ${langClass}`}>
                            {expense.title}
                            {expense.eventName && (
                              <span className="block text-xs text-foreground/60 mt-1">
                                {t('transparency.eventName')}: {expense.eventName}
                              </span>
                            )}
                          </td>
                          <td className={`px-6 py-4 ${langClass}`}>
                            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs">
                              {expense.category}
                            </span>
                          </td>
                          <td className={`px-6 py-4 font-semibold text-orange-600 ${langClass}`}>
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className={`px-6 py-4 text-foreground/70 ${langClass}`}>
                            {expense.approvedBy}
                          </td>
                          <td className={`px-6 py-4 text-foreground/70 ${langClass}`}>
                            {formatDate(expense.date)}
                          </td>
                          <td className="px-6 py-4">
                            {expense.billUrl ? (
                              <a
                                href={expense.billUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 flex items-center gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="text-sm">{t('transparency.viewBill')}</span>
                              </a>
                            ) : (
                              <span className="text-foreground/40 text-sm">-</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {expensesPagination && expensesPagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setExpensePage(p => Math.max(1, p - 1))}
                    disabled={expensePage === 1}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('transparency.previous')}
                  </Button>
                  <span className={`text-foreground/70 ${langClass}`}>
                    {t('transparency.page')} {expensePage} {t('transparency.of')} {expensesPagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setExpensePage(p => Math.min(expensesPagination.totalPages, p + 1))}
                    disabled={expensePage >= expensesPagination.totalPages}
                  >
                    {t('transparency.next')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Transparency;
