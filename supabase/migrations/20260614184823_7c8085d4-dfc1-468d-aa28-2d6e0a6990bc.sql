
drop trigger if exists trg_quiz_sessions_leaderboard on public.quiz_sessions;
create trigger trg_quiz_sessions_leaderboard
after update on public.quiz_sessions
for each row
when (new.status = 'completed' and (old.status is distinct from 'completed'))
execute function public.update_leaderboard_on_quiz();

do $$
declare
  cat record;
  i int;
  q_bn text;
  q_en text;
  opts text[][];
  correct text;
  expl_bn text;
  diff text;
begin
  for cat in select id, slug, name_bn from public.quiz_categories order by display_order loop
    for i in 1..8 loop
      if cat.slug = 'bcs' then
        q_bn := i || '. বাংলাদেশের সংবিধান কত সালে প্রণীত হয়?';
        q_en := i || '. In what year was the Constitution of Bangladesh adopted?';
        opts := array[array['১৯৭১','১৯৭২','১৯৭৩','১৯৭৪'], array['1971','1972','1973','1974']];
        correct := 'b';
        expl_bn := 'বাংলাদেশের সংবিধান ৪ নভেম্বর ১৯৭২ সালে গণপরিষদে গৃহীত হয় এবং ১৬ ডিসেম্বর ১৯৭২ সালে কার্যকর হয়।';
      elsif cat.slug = 'bank' then
        q_bn := i || '. বাংলাদেশ ব্যাংক কত সালে প্রতিষ্ঠিত হয়?';
        q_en := i || '. When was Bangladesh Bank established?';
        opts := array[array['১৯৭১','১৯৭২','১৯৭৩','১৯৭৪'], array['1971','1972','1973','1974']];
        correct := 'b';
        expl_bn := 'বাংলাদেশ ব্যাংক ১৯৭২ সালের ১৬ ডিসেম্বর থেকে কার্যক্রম শুরু করে।';
      elsif cat.slug = 'english' then
        q_bn := i || '. Choose the correct synonym of "Diligent".';
        q_en := i || '. Choose the correct synonym of "Diligent".';
        opts := array[array['Lazy','Hardworking','Careless','Slow'], array['Lazy','Hardworking','Careless','Slow']];
        correct := 'b';
        expl_bn := '"Diligent" অর্থ পরিশ্রমী/মনোযোগী — সমার্থক হলো Hardworking।';
      elsif cat.slug = 'math' then
        q_bn := i || '. ১২ ও ১৮ এর গ.সা.গু কত?';
        q_en := i || '. What is the GCD of 12 and 18?';
        opts := array[array['২','৪','৬','৯'], array['2','4','6','9']];
        correct := 'c';
        expl_bn := '১২ = ২×২×৩, ১৮ = ২×৩×৩ — সাধারণ উৎপাদক ২×৩ = ৬।';
      elsif cat.slug = 'general-knowledge' then
        q_bn := (5+i) || '. বিশ্বের বৃহত্তম মহাসাগর কোনটি?';
        q_en := (5+i) || '. Which is the largest ocean in the world?';
        opts := array[array['আটলান্টিক','প্রশান্ত','ভারত','আর্কটিক'], array['Atlantic','Pacific','Indian','Arctic']];
        correct := 'b';
        expl_bn := 'প্রশান্ত মহাসাগর আয়তনে বিশ্বের বৃহত্তম মহাসাগর।';
      elsif cat.slug = 'international' then
        q_bn := i || '. জাতিসংঘের সদর দপ্তর কোথায়?';
        q_en := i || '. Where is the UN headquarters located?';
        opts := array[array['জেনেভা','নিউইয়র্ক','প্যারিস','লন্ডন'], array['Geneva','New York','Paris','London']];
        correct := 'b';
        expl_bn := 'জাতিসংঘের সদর দপ্তর যুক্তরাষ্ট্রের নিউইয়র্ক শহরে অবস্থিত।';
      elsif cat.slug = 'bangla' then
        q_bn := i || '. "চাঁদের হাট" বাগধারার অর্থ কী?';
        q_en := i || '. What does the idiom "চাঁদের হাট" mean?';
        opts := array[array['দুঃখের সমাবেশ','আনন্দের সমাবেশ','বাজার','রাতের আকাশ'], array['Sad gathering','Joyful gathering','Market','Night sky']];
        correct := 'b';
        expl_bn := '"চাঁদের হাট" অর্থ আনন্দের সমাবেশ বা প্রিয়জনদের মিলনমেলা।';
      elsif cat.slug = 'computer-ict' then
        q_bn := i || '. HTML-এর পূর্ণরূপ কী?';
        q_en := i || '. What does HTML stand for?';
        opts := array[array['Hyper Text Markup Language','High Text Machine Language','Hyperlinks Text Mark Language','Hyper Tool Multi Language'], array['Hyper Text Markup Language','High Text Machine Language','Hyperlinks Text Mark Language','Hyper Tool Multi Language']];
        correct := 'a';
        expl_bn := 'HTML = Hyper Text Markup Language; এটি ওয়েব পেজ তৈরির ভাষা।';
      elsif cat.slug = 'bangladesh-affairs' then
        q_bn := i || '. বাংলাদেশের জাতীয় ফুল কোনটি?';
        q_en := i || '. What is the national flower of Bangladesh?';
        opts := array[array['গোলাপ','শাপলা','পদ্ম','বেলি'], array['Rose','Water Lily','Lotus','Jasmine']];
        correct := 'b';
        expl_bn := 'বাংলাদেশের জাতীয় ফুল শাপলা (Nymphaea nouchali)।';
      elsif cat.slug = 'ethics' then
        q_bn := i || '. সুশাসনের প্রধান শর্ত কোনটি?';
        q_en := i || '. What is the main condition of good governance?';
        opts := array[array['দুর্নীতি','স্বচ্ছতা ও জবাবদিহিতা','একনায়কত্ব','অস্বচ্ছতা'], array['Corruption','Transparency & Accountability','Dictatorship','Opacity']];
        correct := 'b';
        expl_bn := 'সুশাসনের মূল ভিত্তি হলো স্বচ্ছতা এবং জবাবদিহিতা।';
      elsif cat.slug = 'primary-teacher' then
        q_bn := i || '. শিশুর প্রাথমিক ভাষা শেখার শ্রেষ্ঠ পদ্ধতি কোনটি?';
        q_en := i || '. Best method to teach early language to children?';
        opts := array[array['মুখস্থ করানো','খেলার মাধ্যমে শেখানো','লেকচার দেওয়া','পরীক্ষা নেওয়া'], array['Rote memorization','Play-based learning','Lecturing','Testing']];
        correct := 'b';
        expl_bn := 'প্রাথমিক পর্যায়ে শিশুরা খেলার মাধ্যমে শেখায় সবচেয়ে ভালো ফলাফল দেয়।';
      elsif cat.slug = 'post-office' then
        q_bn := i || '. বাংলাদেশ ডাক বিভাগের প্রধান কার্যালয় কোথায়?';
        q_en := i || '. Where is the headquarters of Bangladesh Post Office?';
        opts := array[array['চট্টগ্রাম','ঢাকা','খুলনা','রাজশাহী'], array['Chittagong','Dhaka','Khulna','Rajshahi']];
        correct := 'b';
        expl_bn := 'বাংলাদেশ ডাক বিভাগের প্রধান কার্যালয় ঢাকায় অবস্থিত।';
      else
        q_bn := i || '. নমুনা প্রশ্ন';
        q_en := i || '. Sample question';
        opts := array[array['ক','খ','গ','ঘ'], array['A','B','C','D']];
        correct := 'a';
        expl_bn := 'নমুনা ব্যাখ্যা।';
      end if;

      diff := case when i <= 3 then 'easy' when i <= 6 then 'medium' else 'hard' end;

      insert into public.questions (
        category_id, question_text_bn, question_text_en,
        option_a_bn, option_a_en, option_b_bn, option_b_en,
        option_c_bn, option_c_en, option_d_bn, option_d_en,
        correct_option, explanation_bn, difficulty, is_active
      ) values (
        cat.id, q_bn, q_en,
        opts[1][1], opts[2][1], opts[1][2], opts[2][2],
        opts[1][3], opts[2][3], opts[1][4], opts[2][4],
        correct, expl_bn, diff, true
      );
    end loop;
  end loop;

  update public.quiz_categories c
  set question_count = (select count(*) from public.questions q where q.category_id = c.id and q.is_active);
end $$;
