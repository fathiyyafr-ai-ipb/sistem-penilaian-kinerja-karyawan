const db = require('../config/db');

// 1. ADMIN - Weights
const getWeights = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM assessment_weights WHERE active = true LIMIT 1');
    if (rows.length === 0) {
      // Fallback default weights
      return res.json({ kinerja_weight: 50, perilaku_weight: 30, presensi_weight: 20 });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateWeights = async (req, res) => {
  try {
    const { kinerja_weight, perilaku_weight, presensi_weight } = req.body;
    const kw = parseInt(kinerja_weight);
    const pw = parseInt(perilaku_weight);
    const sw = parseInt(presensi_weight);

    if (kw + pw + sw !== 100) {
      return res.status(400).json({ message: 'Total akumulasi ketiga bobot harus tepat 100%' });
    }

    // Deactive old active weights
    await db.query('UPDATE assessment_weights SET active = false');
    
    // Insert new active weights
    const [result] = await db.query(
      'INSERT INTO assessment_weights (kinerja_weight, perilaku_weight, presensi_weight, active) VALUES (?, ?, ?, true)',
      [kw, pw, sw]
    );

    res.json({ message: 'Bobot penilaian berhasil diperbarui', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 2. KETUA TIM - Kinerja per Kegiatan
const getLeaderActivities = async (req, res) => {
  try {
    const { period } = req.query;
    if (!period) return res.status(400).json({ message: 'period wajib diisi (format: YYYY-Q#)' });

    const parts = period.split('-Q');
    const year = parseInt(parts[0]);
    const quarter = parseInt(parts[1]);

    if (isNaN(year) || isNaN(quarter)) {
      return res.status(400).json({ message: 'format period tidak valid (contoh: 2026-Q1)' });
    }

    // Ambil daftar kegiatan milik tim yang dipimpin Ketua Tim bersangkutan, 
    // beserta anggota tim dan status evaluasi kinerja
    const [rows] = await db.query(`
      SELECT 
        a.id AS activity_id, 
        a.title AS activity_title, 
        a.status AS activity_status,
        u.id AS employee_id, 
        u.name AS employee_name,
        ae.id AS evaluation_id,
        ae.speed_score, 
        ae.quality_score, 
        ae.contribution_score, 
        ae.responsibility_score, 
        ae.notes, 
        COALESCE(ae.status, 'draft') AS evaluation_status
      FROM activities a
      JOIN teams t ON a.team_id = t.id
      JOIN users u ON (a.assigned_to = u.id OR u.id IN (SELECT user_id FROM team_members WHERE team_id = a.team_id))
      LEFT JOIN activity_evaluations ae ON ae.activity_id = a.id AND ae.employee_id = u.id AND ae.period = ?
      WHERE t.leader_id = ?
        AND EXTRACT(YEAR FROM a.deadline) = ?
        AND EXTRACT(QUARTER FROM a.deadline) = ?
      ORDER BY u.name ASC, a.title ASC
    `, [period, req.user.id, year, quarter]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const saveActivityEvaluation = async (req, res) => {
  try {
    const { employee_id, activity_id, period, speed_score, quality_score, contribution_score, responsibility_score, notes, status } = req.body;
    
    if (!employee_id || !activity_id || !period) {
      return res.status(400).json({ message: 'employee_id, activity_id, dan period wajib diisi' });
    }

    const s = parseFloat(speed_score || 0);
    const q = parseFloat(quality_score || 0);
    const c = parseFloat(contribution_score || 0);
    const r = parseFloat(responsibility_score || 0);
    const stat = status || 'draft';

    if (s < 0 || s > 100 || q < 0 || q > 100 || c < 0 || c > 100 || r < 0 || r > 100) {
      return res.status(400).json({ message: 'Nilai komponen harus berada di rentang 0 - 100' });
    }

    // Upsert menggunakan ON CONFLICT
    await db.query(`
      INSERT INTO activity_evaluations (employee_id, activity_id, reviewer_id, period, speed_score, quality_score, contribution_score, responsibility_score, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (employee_id, activity_id)
      DO UPDATE SET 
        speed_score = EXCLUDED.speed_score,
        quality_score = EXCLUDED.quality_score,
        contribution_score = EXCLUDED.contribution_score,
        responsibility_score = EXCLUDED.responsibility_score,
        notes = EXCLUDED.notes,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
    `, [employee_id, activity_id, req.user.id, period, s, q, c, r, notes, stat]);

    res.json({ message: 'Penilaian kinerja kegiatan berhasil disimpan' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 3. KETUA TIM - Perilaku ASN
const getLeaderBehavior = async (req, res) => {
  try {
    const { period } = req.query;
    if (!period) return res.status(400).json({ message: 'period wajib diisi' });

    // Daftar semua anggota tim pelaksana
    const [rows] = await db.query(`
      SELECT DISTINCT
        u.id AS employee_id, 
        u.name AS employee_name, 
        u.nip, 
        u.jabatan,
        be.id AS evaluation_id,
        be.orientasi_pelayanan, 
        be.akuntabilitas, 
        be.kompetensi, 
        be.harmonis, 
        be.loyal, 
        be.adaptif, 
        be.kolaboratif, 
        be.disiplin, 
        be.notes, 
        COALESCE(be.status, 'draft') AS evaluation_status
      FROM users u
      JOIN team_members tm ON u.id = tm.user_id
      JOIN teams t ON tm.team_id = t.id
      LEFT JOIN behavior_evaluations be ON be.employee_id = u.id AND be.period = ?
      WHERE t.leader_id = ? AND u.role = 'pegawai'
      ORDER BY u.name ASC
    `, [period, req.user.id]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const saveBehaviorEvaluation = async (req, res) => {
  try {
    const { 
      employee_id, period, 
      orientasi_pelayanan, akuntabilitas, kompetensi, 
      harmonis, loyal, adaptif, kolaboratif, disiplin, 
      notes, status 
    } = req.body;

    if (!employee_id || !period) {
      return res.status(400).json({ message: 'employee_id dan period wajib diisi' });
    }

    const stat = status || 'draft';

    // Upsert
    await db.query(`
      INSERT INTO behavior_evaluations (
        employee_id, reviewer_id, period, 
        orientasi_pelayanan, akuntabilitas, kompetensi, 
        harmonis, loyal, adaptif, kolaboratif, disiplin, 
        notes, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (employee_id, period)
      DO UPDATE SET
        orientasi_pelayanan = EXCLUDED.orientasi_pelayanan,
        akuntabilitas = EXCLUDED.akuntabilitas,
        kompetensi = EXCLUDED.kompetensi,
        harmonis = EXCLUDED.harmonis,
        loyal = EXCLUDED.loyal,
        adaptif = EXCLUDED.adaptif,
        kolaboratif = EXCLUDED.kolaboratif,
        disiplin = EXCLUDED.disiplin,
        notes = EXCLUDED.notes,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
    `, [
      employee_id, req.user.id, period,
      orientasi_pelayanan, akuntabilitas, kompetensi,
      harmonis, loyal, adaptif, kolaboratif, disiplin,
      notes, stat
    ]);

    // Jika disubmit, kirim notifikasi ke Kepala BPS
    if (stat === 'submitted') {
      const [empRows] = await db.query('SELECT name FROM users WHERE id = ?', [employee_id]);
      const empName = empRows[0]?.name || 'Pegawai';

      const [bpsRows] = await db.query("SELECT id FROM users WHERE role = 'kepala_bps' LIMIT 1");
      if (bpsRows.length > 0) {
        const bpsId = bpsRows[0].id;
        await db.query(
          'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
          [bpsId, `Ketua Tim ${req.user.name} mengirim penilaian Perilaku untuk ${empName} periode ${period}`]
        );
      }
    }

    res.json({ message: 'Penilaian perilaku berhasil disimpan' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 4. KASUBAG - Presensi
const getKasubagAttendance = async (req, res) => {
  try {
    const { period } = req.query;
    if (!period) return res.status(400).json({ message: 'period wajib diisi' });

    // Ambil seluruh pegawai kecuali Kasubag & Kepala BPS
    const [rows] = await db.query(`
      SELECT 
        u.id AS employee_id, 
        u.name AS employee_name, 
        u.nip, 
        u.jabatan,
        ae.id AS evaluation_id,
        ae.attendance_score, 
        ae.notes, 
        COALESCE(ae.status, 'draft') AS evaluation_status
      FROM users u
      LEFT JOIN attendance_evaluations ae ON ae.employee_id = u.id AND ae.period = ?
      WHERE u.role = 'pegawai'
      ORDER BY u.name ASC
    `, [period]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const saveAttendanceEvaluation = async (req, res) => {
  try {
    const { employee_id, period, attendance_score, notes, status } = req.body;

    if (!employee_id || !period) {
      return res.status(400).json({ message: 'employee_id dan period wajib diisi' });
    }

    const stat = status || 'draft';
    const score = parseFloat(attendance_score || 0);

    if (score < 0 || score > 100) {
      return res.status(400).json({ message: 'Skor presensi harus bernilai 0 - 100' });
    }

    // Upsert
    await db.query(`
      INSERT INTO attendance_evaluations (employee_id, reviewer_id, period, attendance_score, notes, status)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (employee_id, period)
      DO UPDATE SET
        attendance_score = EXCLUDED.attendance_score,
        notes = EXCLUDED.notes,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
    `, [employee_id, req.user.id, period, score, notes, stat]);

    // Jika disubmit, trigger notifikasi ke Kepala BPS
    if (stat === 'submitted') {
      const [empRows] = await db.query('SELECT name FROM users WHERE id = ?', [employee_id]);
      const empName = empRows[0]?.name || 'Pegawai';

      const [bpsRows] = await db.query("SELECT id FROM users WHERE role = 'kepala_bps' LIMIT 1");
      if (bpsRows.length > 0) {
        const bpsId = bpsRows[0].id;
        await db.query(
          'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
          [bpsId, `Kasubag Umum ${req.user.name} mengirim penilaian Presensi untuk ${empName} periode ${period}`]
        );
      }
    }

    res.json({ message: 'Penilaian presensi berhasil disimpan' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 5. KEPALA BPS - Review & Validasi
const getBpsReview = async (req, res) => {
  try {
    const { period } = req.query;
    if (!period) return res.status(400).json({ message: 'period wajib diisi' });

    // Dapatkan data bobot aktif
    const [weightsRow] = await db.query('SELECT kinerja_weight, perilaku_weight, presensi_weight FROM assessment_weights WHERE active = true LIMIT 1');
    const weights = weightsRow.length > 0 ? weightsRow[0] : { kinerja_weight: 50, perilaku_weight: 30, presensi_weight: 20 };

    // Ambil daftar Pure Leaders (Leader yang bukan anggota tim lain)
    const [pureLeadersRow] = await db.query(`
      SELECT DISTINCT t.leader_id 
      FROM teams t 
      WHERE t.leader_id NOT IN (
        SELECT DISTINCT tm.user_id 
        FROM team_members tm
        JOIN teams t2 ON tm.team_id = t2.id
        WHERE t2.leader_id != tm.user_id
      )
    `);
    const pureLeaderIds = pureLeadersRow.map(r => r.leader_id);

    // 1. Ambil rekap Kinerja (rata-rata evaluasi kegiatan per pegawai di kuartal)
    const [kinerjaRows] = await db.query(`
      SELECT 
        employee_id, 
        AVG((speed_score + quality_score + contribution_score + responsibility_score) / 4.0) AS avg_kinerja,
        MIN(status) AS min_status,
        COUNT(*) AS count_kegiatan
      FROM activity_evaluations
      WHERE period = ?
      GROUP BY employee_id
    `, [period]);

    // 2. Ambil rekap Perilaku per pegawai
    const [perilakuRows] = await db.query(`
      SELECT 
        employee_id, 
        ((orientasi_pelayanan + akuntabilitas + kompetensi + harmonis + loyal + adaptif + kolaboratif + disiplin) / 8.0) AS avg_perilaku,
        status AS perilaku_status
      FROM behavior_evaluations
      WHERE period = ?
    `, [period]);

    // 3. Ambil rekap Presensi per pegawai
    const [presensiRows] = await db.query(`
      SELECT employee_id, attendance_score, status AS presensi_status
      FROM attendance_evaluations
      WHERE period = ?
    `, [period]);

    // 4. Ambil rekap Validasi / Hasil Akhir yang ada di final_assessments
    const [finalRows] = await db.query(`
      SELECT employee_id, status AS final_status, notes AS bps_notes, kinerja_score, perilaku_score, presensi_score, final_score
      FROM final_assessments
      WHERE period = ?
    `, [period]);

    // 5. Dapatkan semua pegawai BPS
    const [users] = await db.query(`
      SELECT id AS employee_id, name AS employee_name, nip, jabatan
      FROM users
      WHERE role = 'pegawai'
      ORDER BY name ASC
    `);

    // Merge semuanya di Node.js secara dinamis
    const reviewData = users.map(u => {
      const is_pure_leader = pureLeaderIds.includes(u.employee_id);
      const k = kinerjaRows.find(item => item.employee_id === u.employee_id);
      const b = perilakuRows.find(item => item.employee_id === u.employee_id);
      const p = presensiRows.find(item => item.employee_id === u.employee_id);
      const f = finalRows.find(item => item.employee_id === u.employee_id);

      // Kinerja score
      const kinerja_score = is_pure_leader 
        ? (f ? parseFloat(f.kinerja_score) : 0)
        : (k ? parseFloat(k.avg_kinerja) : 0);

      // Perilaku score
      const perilaku_score = is_pure_leader 
        ? (f ? parseFloat(f.perilaku_score) : (b ? parseFloat(b.avg_perilaku) : 0))
        : (b ? parseFloat(b.avg_perilaku) : 0);

      // Presensi score
      const presensi_score = p ? parseFloat(p.attendance_score) : 0;

      // Status pengiriman komponen
      const kinerja_status = is_pure_leader
        ? (f && parseFloat(f.kinerja_score) > 0 ? 'submitted' : 'pending')
        : (k && k.count_kegiatan > 0 && k.min_status === 'submitted' ? 'submitted' : (k && k.count_kegiatan > 0 ? 'draft' : 'pending'));
      
      const perilaku_status = is_pure_leader
        ? (f && parseFloat(f.perilaku_score) > 0 ? 'submitted' : (b ? b.perilaku_status : 'pending'))
        : (b ? b.perilaku_status : 'pending');

      const presensi_status = p ? p.presensi_status : 'pending';

      // Kalkulasi nilai akhir terbobot live
      const kw = weights.kinerja_weight / 100.0;
      const pw = weights.perilaku_weight / 100.0;
      const sw = weights.presensi_weight / 100.0;
      const final_score = is_pure_leader && f && f.final_status !== 'pending'
        ? parseFloat(f.final_score)
        : (kinerja_score * kw) + (perilaku_score * pw) + (presensi_score * sw);

      // Keabsahan validasi: valid jika ketiga komponen statusnya sudah 'submitted'
      // Untuk Pure Leader, hanya butuh presensi disubmit, lalu Kinerja & Perilaku diinput langsung oleh Kepala BPS saat validasi
      const can_validate = is_pure_leader 
        ? (presensi_status === 'submitted')
        : (kinerja_status === 'submitted' && perilaku_status === 'submitted' && presensi_status === 'submitted');

      return {
        ...u,
        is_pure_leader,
        kinerja_score: Math.round(kinerja_score * 100) / 100,
        kinerja_status,
        perilaku_score: Math.round(perilaku_score * 100) / 100,
        perilaku_status,
        presensi_score: Math.round(presensi_score * 100) / 100,
        presensi_status,
        final_score: Math.round(final_score * 100) / 100,
        validation_status: f ? f.final_status : 'pending',
        bps_notes: f ? f.bps_notes : '',
        can_validate
      };
    });

    res.json({ review: reviewData, weights });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const validateAssessment = async (req, res) => {
  try {
    const { employee_id, period, notes } = req.body;
    if (!employee_id || !period) {
      return res.status(400).json({ message: 'employee_id dan period wajib diisi' });
    }

    // Ambil daftar Pure Leaders (Leader yang bukan anggota tim lain)
    const [pureLeadersRow] = await db.query(`
      SELECT DISTINCT t.leader_id 
      FROM teams t 
      WHERE t.leader_id NOT IN (
        SELECT DISTINCT tm.user_id 
        FROM team_members tm
        JOIN teams t2 ON tm.team_id = t2.id
        WHERE t2.leader_id != tm.user_id
      )
    `);
    const pureLeaderIds = pureLeadersRow.map(r => r.leader_id);
    const is_pure_leader = pureLeaderIds.includes(parseInt(employee_id));

    // Ambil rekap skor live untuk validasi
    // 1. Kinerja
    const [kinerjaRows] = await db.query(`
      SELECT AVG((speed_score + quality_score + contribution_score + responsibility_score) / 4.0) AS avg_kinerja
      FROM activity_evaluations
      WHERE employee_id = ? AND period = ? AND status = 'submitted'
    `, [employee_id, period]);

    // 2. Perilaku
    const [perilakuRows] = await db.query(`
      SELECT ((orientasi_pelayanan + akuntabilitas + kompetensi + harmonis + loyal + adaptif + kolaboratif + disiplin) / 8.0) AS avg_perilaku
      FROM behavior_evaluations
      WHERE employee_id = ? AND period = ? AND status = 'submitted'
    `, [employee_id, period]);

    // 3. Presensi
    const [presensiRows] = await db.query(`
      SELECT attendance_score
      FROM attendance_evaluations
      WHERE employee_id = ? AND period = ? AND status = 'submitted'
    `, [employee_id, period]);

    let kinerja_score = 0;
    let perilaku_score = 0;

    if (is_pure_leader) {
      // Untuk Pure Leader, nilai Kinerja & Perilaku diinput langsung oleh Kepala BPS saat validasi
      if (req.body.kinerja_score === undefined || req.body.perilaku_score === undefined) {
        return res.status(400).json({ message: 'Skor Kinerja dan Perilaku wajib diisi untuk Ketua Tim' });
      }
      kinerja_score = parseFloat(req.body.kinerja_score);
      perilaku_score = parseFloat(req.body.perilaku_score);

      // Simpan behavior_evaluations untuk Pure Leader
      await db.query(`
        INSERT INTO behavior_evaluations (
          employee_id, reviewer_id, period, 
          orientasi_pelayanan, akuntabilitas, kompetensi, 
          harmonis, loyal, adaptif, kolaboratif, disiplin, 
          notes, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted')
        ON CONFLICT (employee_id, period)
        DO UPDATE SET
          orientasi_pelayanan = EXCLUDED.orientasi_pelayanan,
          akuntabilitas = EXCLUDED.akuntabilitas,
          kompetensi = EXCLUDED.kompetensi,
          harmonis = EXCLUDED.harmonis,
          loyal = EXCLUDED.loyal,
          adaptif = EXCLUDED.adaptif,
          kolaboratif = EXCLUDED.kolaboratif,
          disiplin = EXCLUDED.disiplin,
          notes = EXCLUDED.notes,
          status = 'submitted',
          updated_at = CURRENT_TIMESTAMP
      `, [
        employee_id, req.user.id, period,
        perilaku_score, perilaku_score, perilaku_score,
        perilaku_score, perilaku_score, perilaku_score,
        perilaku_score, perilaku_score, notes
      ]);
    } else {
      if (kinerjaRows.length === 0 || perilakuRows.length === 0 ||
          kinerjaRows[0].avg_kinerja === null || perilakuRows[0].avg_perilaku === null) {
        return res.status(400).json({ message: 'Gagal melakukan validasi. Pastikan seluruh komponen penilaian pegawai telah berstatus Submitted.' });
      }
      kinerja_score = parseFloat(kinerjaRows[0].avg_kinerja);
      perilaku_score = parseFloat(perilakuRows[0].avg_perilaku);
    }

    if (presensiRows.length === 0 || presensiRows[0].attendance_score === null) {
      return res.status(400).json({ message: 'Gagal melakukan validasi. Pastikan nilai presensi telah diinput oleh Kasubag.' });
    }
    const presensi_score = parseFloat(presensiRows[0].attendance_score);

    // Dapatkan data bobot aktif
    const [weightsRow] = await db.query('SELECT kinerja_weight, perilaku_weight, presensi_weight FROM assessment_weights WHERE active = true LIMIT 1');
    const weights = weightsRow.length > 0 ? weightsRow[0] : { kinerja_weight: 50, perilaku_weight: 30, presensi_weight: 20 };

    const kw = weights.kinerja_weight / 100.0;
    const pw = weights.perilaku_weight / 100.0;
    const sw = weights.presensi_weight / 100.0;
    const final_score = (kinerja_score * kw) + (perilaku_score * pw) + (presensi_score * sw);

    // Upsert ke final_assessments
    await db.query(`
      INSERT INTO final_assessments (employee_id, period, kinerja_score, perilaku_score, presensi_score, final_score, validated_by, validated_at, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 'validated')
      ON CONFLICT (employee_id, period)
      DO UPDATE SET
        kinerja_score = EXCLUDED.kinerja_score,
        perilaku_score = EXCLUDED.perilaku_score,
        presensi_score = EXCLUDED.presensi_score,
        final_score = EXCLUDED.final_score,
        validated_by = EXCLUDED.validated_by,
        validated_at = CURRENT_TIMESTAMP,
        notes = EXCLUDED.notes,
        status = 'validated',
        updated_at = CURRENT_TIMESTAMP
    `, [employee_id, period, kinerja_score, perilaku_score, presensi_score, final_score, req.user.id, notes]);

    res.json({ message: 'Validasi berhasil disimpan' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const publishPeriod = async (req, res) => {
  try {
    const { period } = req.body;
    if (!period) return res.status(400).json({ message: 'period wajib diisi' });

    // 1. Dapatkan seluruh pegawai BPS
    const [users] = await db.query("SELECT id, name FROM users WHERE role = 'pegawai'");

    // 2. Dapatkan daftar Pure Leaders (Leader yang bukan anggota tim lain)
    const [pureLeadersRow] = await db.query(`
      SELECT DISTINCT t.leader_id 
      FROM teams t 
      WHERE t.leader_id NOT IN (
        SELECT DISTINCT tm.user_id 
        FROM team_members tm
        JOIN teams t2 ON tm.team_id = t2.id
        WHERE t2.leader_id != tm.user_id
      )
    `);
    const pureLeaderIds = pureLeadersRow.map(r => r.leader_id);

    // 3. Ambil bobot aktif
    const [weightsRow] = await db.query('SELECT kinerja_weight, perilaku_weight, presensi_weight FROM assessment_weights WHERE active = true LIMIT 1');
    const weights = weightsRow.length > 0 ? weightsRow[0] : { kinerja_weight: 50, perilaku_weight: 30, presensi_weight: 20 };

    // 4. Ambil rekap penilaian final yang sudah tervalidasi/terpublikasi untuk periode tersebut
    const [finalAssessments] = await db.query("SELECT employee_id, status FROM final_assessments WHERE period = ?", [period]);

    // 5. Cek setiap pegawai, jika belum tervalidasi, lakukan validasi otomatis
    for (const u of users) {
      const is_pure_leader = pureLeaderIds.includes(u.id);
      const fa = finalAssessments.find(a => a.employee_id === u.id);

      if (fa && (fa.status === 'validated' || fa.status === 'published')) {
        // Sudah divalidasi, abaikan
        continue;
      }

      // Belum divalidasi.
      if (is_pure_leader) {
        // Pure Leader tidak bisa otomatis divalidasi karena Kepala BPS harus memasukkan nilai Kinerja & Perilaku secara manual terlebih dahulu
        return res.status(400).json({ 
          message: `Gagal finalisasi. Ketua Tim (Pure Leader) ${u.name} belum memiliki penilaian Kinerja & Perilaku dari Kepala BPS.` 
        });
      }

      // Ambil kelengkapan komponen regular pegawai
      const [kinerjaRows] = await db.query(`
        SELECT AVG((speed_score + quality_score + contribution_score + responsibility_score) / 4.0) AS avg_kinerja,
               MIN(status) AS min_status,
               COUNT(*) AS count_kegiatan
        FROM activity_evaluations
        WHERE employee_id = ? AND period = ?
        GROUP BY employee_id
      `, [u.id, period]);

      const [perilakuRows] = await db.query(`
        SELECT ((orientasi_pelayanan + akuntabilitas + kompetensi + harmonis + loyal + adaptif + kolaboratif + disiplin) / 8.0) AS avg_perilaku,
               status AS perilaku_status
        FROM behavior_evaluations
        WHERE employee_id = ? AND period = ?
      `, [u.id, period]);

      const [presensiRows] = await db.query(`
        SELECT attendance_score, status AS presensi_status
        FROM attendance_evaluations
        WHERE employee_id = ? AND period = ?
      `, [u.id, period]);

      // Validasi komponen harus komplit (status = 'submitted')
      const hasKinerja = kinerjaRows.length > 0 && kinerjaRows[0].count_kegiatan > 0 && kinerjaRows[0].min_status === 'submitted';
      const hasPerilaku = perilakuRows.length > 0 && perilakuRows[0].perilaku_status === 'submitted';
      const hasPresensi = presensiRows.length > 0 && presensiRows[0].presensi_status === 'submitted';

      if (!hasKinerja || !hasPerilaku || !hasPresensi) {
        return res.status(400).json({
          message: `Gagal finalisasi. Komponen penilaian untuk pegawai ${u.name} belum komplit. (Kinerja: ${hasKinerja?'Ready':'Belum'}, Perilaku: ${hasPerilaku?'Ready':'Belum'}, Presensi: ${hasPresensi?'Ready':'Belum'})`
        });
      }

      // Hitung live score
      const kinerja_score = parseFloat(kinerjaRows[0].avg_kinerja);
      const perilaku_score = parseFloat(perilakuRows[0].avg_perilaku);
      const presensi_score = parseFloat(presensiRows[0].attendance_score);

      const kw = weights.kinerja_weight / 100.0;
      const pw = weights.perilaku_weight / 100.0;
      const sw = weights.presensi_weight / 100.0;
      const final_score = (kinerja_score * kw) + (perilaku_score * pw) + (presensi_score * sw);

      // Simpan validasi otomatis
      await db.query(`
        INSERT INTO final_assessments (employee_id, period, kinerja_score, perilaku_score, presensi_score, final_score, validated_by, validated_at, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 'validated')
        ON CONFLICT (employee_id, period)
        DO UPDATE SET
          kinerja_score = EXCLUDED.kinerja_score,
          perilaku_score = EXCLUDED.perilaku_score,
          presensi_score = EXCLUDED.presensi_score,
          final_score = EXCLUDED.final_score,
          validated_by = EXCLUDED.validated_by,
          validated_at = CURRENT_TIMESTAMP,
          notes = EXCLUDED.notes,
          status = 'validated',
          updated_at = CURRENT_TIMESTAMP
      `, [u.id, period, kinerja_score, perilaku_score, presensi_score, final_score, req.user.id, 'Sistem Auto-Validasi']);
    }

    // 6. Jalankan proses publikasi kuartal ke status 'published'
    const [result] = await db.query(
      "UPDATE final_assessments SET status = 'published', updated_at = CURRENT_TIMESTAMP WHERE period = ? AND status = 'validated'",
      [period]
    );

    // 7. Kirim notifikasi rilis penilaian ke seluruh pegawai
    const [empRows] = await db.query("SELECT id FROM users WHERE role = 'pegawai'");
    for (const emp of empRows) {
      await db.query(
        'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
        [emp.id, `Penilaian kinerja dan rilis predikat Best Employee periode ${period} telah resmi diterbitkan. Silakan periksa hasil nilai akhir Anda.`]
      );
    }

    // 8. Auto-deactivate active Ad-hoc teams whose activities are all complete ('selesai')
    const [activeAdhocTeams] = await db.query(
      "SELECT id, team_name FROM teams WHERE type = 'adhoc' AND is_active = true"
    );

    for (const team of activeAdhocTeams) {
      const [teamActivities] = await db.query(
        "SELECT id, status FROM activities WHERE team_id = ?",
        [team.id]
      );

      // If the team has activities and all of them are completed ('selesai')
      if (teamActivities.length > 0 && teamActivities.every(act => act.status === 'selesai')) {
        await db.query("UPDATE teams SET is_active = false WHERE id = ?", [team.id]);
        console.log(`Auto-deactivated ad-hoc team: ${team.team_name} (ID: ${team.id})`);
      }
    }

    res.json({ message: `Berhasil mempublikasikan penilaian kuartal ${period}. Seluruh pegawai telah tervalidasi secara otomatis.`, updated: result.affectedRows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 6. PEGAWAI / ALL - Scores & Leaderboard
const getMyScore = async (req, res) => {
  try {
    const { period } = req.query;
    if (!period) return res.status(400).json({ message: 'period wajib diisi' });

    // Ambil rekap terpublikasi
    const [finalRows] = await db.query(`
      SELECT fa.*, u.name AS validated_by_name
      FROM final_assessments fa
      LEFT JOIN users u ON fa.validated_by = u.id
      WHERE fa.employee_id = ? AND fa.period = ? AND fa.status = 'published'
    `, [req.user.id, period]);

    if (finalRows.length === 0) {
      return res.status(404).json({ message: 'Hasil penilaian untuk periode ini belum dipublikasikan oleh Kepala BPS' });
    }

    const f = finalRows[0];

    // Ambil detail Kinerja per kegiatan
    const [activities] = await db.query(`
      SELECT a.title AS activity_title, ae.speed_score, ae.quality_score, ae.contribution_score, ae.responsibility_score, ae.notes
      FROM activity_evaluations ae
      JOIN activities a ON ae.activity_id = a.id
      WHERE ae.employee_id = ? AND ae.period = ? AND ae.status = 'submitted'
    `, [req.user.id, period]);

    // Ambil detail Perilaku
    const [behavior] = await db.query(`
      SELECT orientasi_pelayanan, akuntabilitas, kompetensi, harmonis, loyal, adaptif, kolaboratif, disiplin, notes
      FROM behavior_evaluations
      WHERE employee_id = ? AND period = ? AND status = 'submitted'
    `, [req.user.id, period]);

    // Ambil detail Presensi
    const [attendance] = await db.query(`
      SELECT attendance_score, notes
      FROM attendance_evaluations
      WHERE employee_id = ? AND period = ? AND status = 'submitted'
    `, [req.user.id, period]);

    res.json({
      summary: f,
      details: {
        activities,
        behavior: behavior.length > 0 ? behavior[0] : null,
        attendance: attendance.length > 0 ? attendance[0] : null
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getTop3 = async (req, res) => {
  try {
    const { period } = req.query;
    if (!period) return res.status(400).json({ message: 'period wajib diisi' });

    // Urutkan berdasarkan final_score DESC, tie-breaker: perilaku_score DESC, disusul kinerja_score DESC
    const [rows] = await db.query(`
      SELECT fa.*, u.name AS employee_name, u.jabatan, u.nip
      FROM final_assessments fa
      JOIN users u ON fa.employee_id = u.id
      WHERE fa.period = ? AND fa.status = 'published'
      ORDER BY fa.final_score DESC, fa.perilaku_score DESC, fa.kinerja_score DESC
      LIMIT 3
    `, [period]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 7. NOTIFICATIONS
const getNotifications = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 15',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const markNotificationsRead = async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = true WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Seluruh notifikasi berhasil ditandai telah dibaca' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAssessmentReportDetail = async (req, res) => {
  try {
    const { employee_id, period } = req.query;
    if (!employee_id || !period) {
      return res.status(400).json({ message: 'employee_id dan period wajib diisi' });
    }

    // 1. Get Employee info
    const [employeeRows] = await db.query(
      'SELECT id, name, nip, pangkat, jabatan, unit_kerja, role FROM users WHERE id = ?',
      [employee_id]
    );
    if (!employeeRows.length) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }
    const employee = employeeRows[0];

    // Check if pure leader
    const [pureLeadersRow] = await db.query(`
      SELECT DISTINCT t.leader_id 
      FROM teams t 
      WHERE t.leader_id NOT IN (
        SELECT DISTINCT tm.user_id 
        FROM team_members tm
        JOIN teams t2 ON tm.team_id = t2.id
        WHERE t2.leader_id != tm.user_id
      )
    `);
    const pureLeaderIds = pureLeadersRow.map(r => r.leader_id);
    const is_pure_leader = pureLeaderIds.includes(parseInt(employee_id));

    // 2. Get Evaluator info (Kepala BPS)
    const [evaluatorRows] = await db.query(
      "SELECT id, name, nip, pangkat, jabatan, unit_kerja FROM users WHERE role = 'kepala_bps' LIMIT 1"
    );
    const evaluator = evaluatorRows[0] || {
      name: 'Bambang Suryanggono, SST., M.Ec.Dev',
      nip: '198209282004121001',
      pangkat: 'Pembina Tk. I / IV/b',
      jabatan: 'Kepala BPS Kabupaten/Kota',
      unit_kerja: 'BPS Kabupaten Solok'
    };

    // 3. Get weights active
    const [weightsRow] = await db.query(
      'SELECT kinerja_weight, perilaku_weight, presensi_weight FROM assessment_weights WHERE active = true LIMIT 1'
    );
    const weights = weightsRow.length > 0 ? weightsRow[0] : { kinerja_weight: 50, perilaku_weight: 30, presensi_weight: 20 };

    // 4. Get Final Assessment
    const [finalRows] = await db.query(
      'SELECT * FROM final_assessments WHERE employee_id = ? AND period = ?',
      [employee_id, period]
    );
    const final_assessment = finalRows[0] || null;

    // 5. Get Activity Evaluations & realization logs
    const [activities] = await db.query(`
      SELECT 
        ae.activity_id,
        a.title,
        a.description,
        ae.speed_score,
        ae.quality_score,
        ae.contribution_score,
        ae.responsibility_score,
        ((ae.speed_score + ae.quality_score + ae.contribution_score + ae.responsibility_score) / 4.0) AS avg_score,
        ae.notes AS evaluation_notes
      FROM activity_evaluations ae
      JOIN activities a ON ae.activity_id = a.id
      WHERE ae.employee_id = ? AND ae.period = ?
    `, [employee_id, period]);

    // Fetch the latest realization notes/links for these activities
    const [progressRows] = await db.query(`
      SELECT DISTINCT ON (activity_id) activity_id, progress_percentage, notes, file_report, created_at
      FROM activity_progress
      WHERE user_id = ?
      ORDER BY activity_id, created_at DESC
    `, [employee_id]);

    const activitiesWithRealization = activities.map(act => {
      const prog = progressRows.find(p => p.activity_id === act.activity_id);
      return {
        ...act,
        realization_percentage: prog ? prog.progress_percentage : 0,
        realization_notes: prog ? prog.notes : 'Selesai 100% dan tepat waktu',
        proof_link: prog ? prog.file_report : ''
      };
    });

    // 6. Get Behavior Evaluation
    const [behaviorRows] = await db.query(
      'SELECT * FROM behavior_evaluations WHERE employee_id = ? AND period = ?',
      [employee_id, period]
    );
    const behavior = behaviorRows[0] || null;

    // 7. Get Attendance Evaluation
    const [attendanceEvaluationRows] = await db.query(
      'SELECT * FROM attendance_evaluations WHERE employee_id = ? AND period = ?',
      [employee_id, period]
    );
    const attendance_evaluation = attendanceEvaluationRows[0] || null;

    // Fetch raw attendance metrics for this period
    const [attendanceDetailsRows] = await db.query(
      'SELECT * FROM attendance WHERE user_id = ? AND periode = ?',
      [employee_id, period]
    );
    const attendance_detail = attendanceDetailsRows[0] || null;

    res.json({
      employee: {
        ...employee,
        is_pure_leader
      },
      evaluator,
      weights,
      final_assessment,
      activities: activitiesWithRealization,
      behavior,
      attendance: {
        evaluation: attendance_evaluation,
        detail: attendance_detail
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getWeights,
  updateWeights,
  getLeaderActivities,
  saveActivityEvaluation,
  getLeaderBehavior,
  saveBehaviorEvaluation,
  getKasubagAttendance,
  saveAttendanceEvaluation,
  getBpsReview,
  validateAssessment,
  publishPeriod,
  getMyScore,
  getTop3,
  getNotifications,
  markNotificationsRead,
  getAssessmentReportDetail
};
