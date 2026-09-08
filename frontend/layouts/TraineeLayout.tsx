/* eslint-disable */
// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { TRAINEE_NAV } from '../config/navigation';
import UnifiedLayout from './UnifiedLayout';

const GREETINGS = [
  "Official Statistics Capacity Building Portal (MoSPI)",
  "National Statistical Systems Training Academy (NSSTA)",
  "iGOT Karmayogi Integrated Learning Pathway",
  "Continuous Capacity Building & Competency Diagnostics",
  "Equipping India's Statistical Cadre for Modern Governance"
];

const TraineeLayout = () => {
  const [loading, setLoading] = useState(true);
  const [traineeName, setTraineeName] = useState("Officer");
  const [greeting] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);

  useEffect(() => {
    let mounted = true;

    const fetchTraineeName = async (user) => {
      try {
        const { data: userData } = await supabase.from('users').select('full_name').eq('id', user.id).single();
        if (mounted) {
          if (userData && userData.full_name) {
            setTraineeName(userData.full_name.split(' ')[0]);
          } else {
            setTraineeName((user.user_metadata?.full_name || "Officer").split(' ')[0]);
          }
        }
      } catch (error) {
        if (mounted) setTraineeName((user.user_metadata?.full_name || "Officer").split(' ')[0]);
      }
      if (mounted) setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchTraineeName(session.user);
      } else if (mounted) {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          fetchTraineeName(session.user);
        } else if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="statcap-page-shell"><div className="skeleton-base" style={{ height: '32px', width: '280px', borderRadius: '8px', marginBottom: '8px' }} /></div>;
  }

  return (
    <UnifiedLayout 
      title={`Welcome, ${traineeName}`} 
      subtitle={greeting} 
      navItems={TRAINEE_NAV}
      showSignOut={false}
      isStudent={true}
    />
  );
};

export default TraineeLayout;
