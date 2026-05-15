import { CropGuide } from "./types";

export const CROP_GUIDES: CropGuide[] = [
  {
    id: "padi",
    name: "Padi",
    category: "Pangan",
    planting: "Padi memerlukan tanah yang gembur dan air yang cukup. Sebaiknya ditanam pada awal musim hujan atau musim kemarau dengan bantuan irigasi.",
    fertilization: "Pemupukan pertama pada usia 15 hari HST dengan Urea dan SP-36. Pemupukan susulan pada usia 30 dan 45 HST.",
    operational: "Pengairan harus dikelola dengan baik, terutama pada fase primordia dan pembungaan.",
    pestControl: "Gunakan pestisida organik untuk wereng coklat dan penggerek batang jika serangan melebihi ambang ekonomi.",
    image: "https://picsum.photos/seed/padi/400/250"
  },
  {
    id: "sayuran-bayam",
    name: "Sayuran Bayam",
    category: "Sayuran",
    planting: "Bayam dapat ditanam sepanjang tahun. Gunakan bedengan dengan lebar 1m dan panjang menyesuaikan lahan.",
    fertilization: "Gunakan pupuk kandang yang sudah matang sebagai pupuk dasar. Tambahkan pupuk daun setiap minggu.",
    operational: "Penyiraman rutin pagi dan sore hari. Penyiangan gulma dilakukan secara manual.",
    pestControl: "Waspadai ulat daun. Gunakan ekstrak tembakau sebagai pestisida alami.",
    image: "https://picsum.photos/seed/bayam/400/250"
  },
  {
    id: "buah-mangga",
    name: "Mangga",
    category: "Buah",
    planting: "Jarak tanam ideal 10x10 meter. Lubang tanam 60x60x60 cm.",
    fertilization: "Pupuk NPK 1kg per pohon per semester. Tambahkan pupuk organik 20kg per pohon per tahun.",
    operational: "Pemangkasan tunas air untuk merangsang pembuahan. Penjarangan buah jika terlalu lebat.",
    pestControl: "Lalat buah adalah tantangan utama. Gunakan perangkap metileugenol.",
    image: "https://picsum.photos/seed/mangga/400/250"
  },
  {
    id: "tebu",
    name: "Tebu",
    category: "Tebu",
    planting: "Penanaman menggunakan stek (bibit pucuk). Jarak antar baris 1-1.2 meter.",
    fertilization: "Memerlukan nitrogen tinggi pada fase pertumbuhan awal. Gunakan ZA dan KCl.",
    operational: "Klentek (pembersihan daun kering) dilakukan 2-3 kali sebelum panen.",
    pestControl: "Penggerek pucuk dan batang. Gunakan parasitoid Trichogramma.",
    image: "https://picsum.photos/seed/tebu/400/250"
  },
  {
    id: "tanaman-jahe",
    name: "Jahe",
    category: "Tanaman Bumbu",
    planting: "Tanam pada kedalaman 5-7 cm dengan mata tunas menghadap ke atas.",
    fertilization: "Pupuk dasar TSP dan KCl. Tambahkan Urea pada bulan ke 2, 4, dan 6.",
    operational: "Pembumbunan rimpang dilakukan setiap 2 bulan untuk memperluas ruang rimpang.",
    pestControl: "Penyakit layu bakteri adalah tantangan utama. Jaga drainase agar tidak tergenang.",
    image: "https://picsum.photos/seed/ginger/400/250"
  },
  {
    id: "jagung",
    name: "Jagung",
    category: "Pangan",
    planting: "Tanam sedalam 3-5 cm. Jarak tanam 75x20 cm per lubang 1 biji.",
    fertilization: "Pupuk Urea, SP36, dan KCl tiga kali: umur 7-10 HST, 28-30 HST, dan 45-50 HST.",
    operational: "Penyiangan dan pendangiran bersamaan dengan pemupukan kedua.",
    pestControl: "Ulat grayak frugiperda (FAW). Pantau titik tumbuh tanaman.",
    image: "https://picsum.photos/seed/corn/400/250"
  },
  {
    id: "cabai",
    name: "Cabai Merah",
    category: "Sayuran",
    planting: "Gunakan mulsa plastik hitam perak. Jarak tanam 60x60 cm zig-zag.",
    fertilization: "Utamakan pupuk dasar NPK dan kalsium. Berikan pupuk kocor NPK setiap 10 hari.",
    operational: "Pemasangan ajir (bambu penyangga) saat tanaman berusia 15 HST.",
    pestControl: "Kutu daun dan thrips. Gunakan fungisida jika cuaca terlalu lembab untuk antraknosa.",
    image: "https://picsum.photos/seed/chili/400/250"
  },
  {
    id: "kakao",
    name: "Kakao",
    category: "Perkebunan",
    planting: "Memerlukan pohon pelindung (lamtoro/sengon). Jarak tanam 3x3 meter.",
    fertilization: "Pemupukan melingkar di bawah tajuk daun. Gunakan NPK setiap 4 bulan.",
    operational: "Pemangkasan rutin: pangkas bentuk, pangkas pemeliharaan, dan pangkas produksi.",
    pestControl: "Penggerek Buah Kakao (PBK). Lakukan penyarungan buah dengan plastik.",
    image: "https://picsum.photos/seed/cocoa/400/250"
  },
  {
    id: "kopi",
    name: "Kopi Arabika",
    category: "Perkebunan",
    planting: "Ideal di ketinggian >1000 mdpl. Lubang tanam 60x60 cm.",
    fertilization: "Pupuk organik minimal 10kg/pohon/tahun. NPK 250g/pohon/tahun.",
    operational: "Pemangkasan cabang yang tidak produktif. Panen hanya buah merah (petik merah).",
    pestControl: "Bubuk buah kopi (Hypothenemus hampei). Bersihkan buah yang jatuh ke tanah.",
    image: "https://picsum.photos/seed/coffee/400/250"
  },
  {
    id: "bawang-merah",
    name: "Bawang Merah",
    category: "Tanaman Bumbu",
    planting: "Pilih bibit yang sudah disimpan 2-3 bulan. Potong ujung umbi 1/3 bagian sebelum tanam.",
    fertilization: "Sangat responsif terhadap kalium. Gunakan NPK dan pupuk daun mikro.",
    operational: "Penyiraman pagi dan sore. Jaga kelembaban tanah tapi jangan sampai tergenang.",
    pestControl: "Ulat grayak bawang (Spodoptera exigua). Gunakan feromon trap.",
    image: "https://picsum.photos/seed/onion/400/250"
  }
];

export const LIVESTOCK_GUIDES: any[] = [
  {
    id: "ayam-petelur",
    name: "Ayam Petelur",
    category: "Unggas",
    breeding: "Gunakan bibit (DOC) dari strain unggul. Pastikan litter/alas sekam selalu kering.",
    feeding: "Pakan fase starter, grower, dan layer dengan kandungan kalsium tinggi untuk cangkang telur.",
    operational: "Pencahayaan 16 jam sehari untuk merangsang produksi telur. Vaksinasi rutin AI dan ND.",
    diseaseControl: "Waspadai Flu Burung. Lakukan biosekuriti ketat and sanitasi alas kandang.",
    image: "https://picsum.photos/seed/chicken-egg/400/250"
  },
  {
    id: "sapi-potong",
    name: "Sapi Potong",
    category: "Ruminansia",
    breeding: "Pilih bakalan sapi jantan usia 1.5-2 tahun. Kandang harus memiliki sirkulasi udara baik.",
    feeding: "Kombinasi hijauan (rumput gajah) and konsentrat (ampas tahu/dedak) untuk penggemukan.",
    operational: "Pembersihan kandang setiap pagi. Penimbangan berat badan berkala setiap bulan.",
    diseaseControl: "Waspadai penyakit mulut and kuku (PMK). Berikan vaksinasi berkala.",
    image: "https://picsum.photos/seed/beef-cow/400/250"
  },
  {
    id: "kambing-perah",
    name: "Kambing Etawa",
    category: "Ruminansia",
    breeding: "Pilih kambing dengan ambing simetris. Kandang panggung untuk menjaga kebersihan.",
    feeding: "Berikan leguminosa (daun lamtoro/gamal) and tambahan karbohidrat.",
    operational: "Pemerahan dilakukan 2 kali sehari. Jaga sterilitas wadah susu.",
    diseaseControl: "Waspadai mastitis (radang ambing). Bersihkan ambing sebelum and sesudah diperah.",
    image: "https://picsum.photos/seed/goat-milk/400/250"
  },
  {
    id: "ikan-lele",
    name: "Ikan Lele",
    category: "Perikanan",
    breeding: "Gunakan kolam terpal atau beton. Padat tebar 100-150 ekor/m3.",
    feeding: "Berikan pelet dengan protein >30%. Frekuensi makan 3 kali sehari.",
    operational: "Penyortiran ukuran setiap 2 minggu untuk mencegah kanibalisme.",
    diseaseControl: "Gunakan garam krosok and daun sirsak untuk mencegah jamur/penyakit kuning.",
    image: "https://picsum.photos/seed/catfish/400/250"
  },
  {
    id: "burung-puyuh",
    name: "Burung Puyuh",
    category: "Unggas",
    breeding: "Kandang baterai bertingkat. Suhu ideal 25-30 derajat celcius.",
    feeding: "Pakan bentuk tepung (mash) khusus puyuh. Minum harus selalu tersedia.",
    operational: "Pengambilan telur setiap pagi. Bersihkan kotoran di bawah kandang setiap 3 hari.",
    diseaseControl: "Waspadai penyakit berak kapur. Jaga sirkulasi udara kandang.",
    image: "https://picsum.photos/seed/quail/400/250"
  },
  {
    id: "bebek-petelur",
    name: "Bebek Petelur",
    category: "Unggas",
    breeding: "Bebek lebih tahan penyakit dibanding ayam. Kandang kering tanpa area berenang luas.",
    feeding: "Pakan campuran dedak, menir, and tepung ikan atau pakan jadi layer.",
    operational: "Bebek bertelur saat dini hari. Pengumpulan telur dilakukan pukul 7 pagi.",
    diseaseControl: "Flu burung and kolera. Pastikan air minum bersih and tidak tercemar.",
    image: "https://picsum.photos/seed/duck/400/250"
  },
  {
    id: "domba-garut",
    name: "Domba Garut",
    category: "Ruminansia",
    breeding: "Pilih pejantan dengan tanduk besar and simetris. Jaga kebersihan bulu.",
    feeding: "Hijauan berkualitas tinggi. Berikan suplemen mineral blok di kandang.",
    operational: "Pemandian and cukur bulu setiap 3 bulan untuk kesehatan kulit.",
    diseaseControl: "Waspadai cacingan (scabies). Lakukan pemberian obat cacing rutin.",
    image: "https://picsum.photos/seed/sheep/400/250"
  },
  {
    id: "ikan-nila",
    name: "Ikan Nila",
    category: "Perikanan",
    breeding: "Kolam arus deras atau keramba jaring apung. Oksigen harus tercukupi.",
    feeding: "Pelet apung. Nila juga bisa diberi pakan alternatif seperti azolla.",
    operational: "Monitor kualitas air (pH and suhu) secara berkala.",
    diseaseControl: "Penyakit Streptococcosis. Kurangi kepadatan kolam jika ada gejala kematian.",
    image: "https://picsum.photos/seed/tilapia/400/250"
  },
  {
    id: "kelinci-pedaging",
    name: "Kelinci New Zealand",
    category: "Mamalia Kecil",
    breeding: "Kandang kawat ram agar urin jatuh ke bawah. Suhu harus sejuk.",
    feeding: "Pelet kelinci and hijauan layu (tidak segar untuk mencegah perut kembung).",
    operational: "Induk menyusui membutuhkan nutrisi lebih tinggi. Pisahkan pejantan setelah kawin.",
    diseaseControl: "Waspadai kudis (ear canker) and kembung (bloat).",
    image: "https://picsum.photos/seed/rabbit/400/250"
  },
  {
    id: "ikan-gurame",
    name: "Ikan Gurame",
    category: "Perikanan",
    breeding: "Pertumbuhan lambat tapi nilai jual tinggi. Gunakan kolam tenang dengan pelindung.",
    feeding: "Pelet and tambahan daun talas atau daun singkong untuk serat.",
    operational: "Waktu panen biasanya 8-12 bulan tergantung ukuran permintaan.",
    diseaseControl: "Waspadai jamur kulit. Gunakan larutan PK atau ekstrak daun pepaya.",
    image: "https://picsum.photos/seed/carp/400/250"
  },
  {
    id: "kerbau-lumpur",
    name: "Kerbau Lumpur",
    category: "Ruminansia",
    breeding: "Memerlukan kubangan untuk mendinginkan suhu tubuh di siang hari.",
    feeding: "Hijauan rendah kualitas pun bisa diolah kerbau dengan baik (tongkol jagung/jerami).",
    operational: "Penggembalaan liar di lahan luas atau sistem cut and carry.",
    diseaseControl: "Septicaemia Epizootica (SE) atau penyakit ngorok. Vaksinasi SE mutlak.",
    image: "https://picsum.photos/seed/buffalo/400/250"
  },
  {
    id: "burung-walet",
    name: "Burung Walet",
    category: "Unggas",
    breeding: "Gedung khusus dengan kelembaban 85-90% and suhu 26-29 derajat.",
    feeding: "Mencari makan sendiri di alam (serangga kecil). Bisa dibantu dengan pancingan lalat.",
    operational: "Gunakan audio pancing (suara walet) untuk menarik koloni menginap.",
    diseaseControl: "Hama predator seperti tikus, kecoa, and burung hantu harus dibasmi.",
    image: "https://picsum.photos/seed/swallow/400/250"
  },
  {
    id: "udang-vaname",
    name: "Udang Vaname",
    category: "Perikanan",
    breeding: "Tambak teknologi intensif dengan kincir air untuk oksigen.",
    feeding: "Pakan udang high-protein. Berikan sesuai dengan estimasi biomassa.",
    operational: "Cek kualitas air setiap 3 jam (Suhu, Salinitas, DO, pH).",
    diseaseControl: "Penyakit EMS and WFD. Jaga kebersihan dasar tambak (sipon).",
    image: "https://picsum.photos/seed/shrimp/400/250"
  },
  {
    id: "sapi-perah",
    name: "Sapi Friesian Holstein",
    category: "Ruminansia",
    breeding: "Udara pegunungan yang sejuk. Inseminasi buatan untuk perbaikan genetik.",
    feeding: "Konsetrat tinggi protein and silase jagung untuk produksi susu maksimal.",
    operational: "Sanitasi peralatan perah dengan air panas. Cooling unit untuk simpan susu.",
    diseaseControl: "Waspadai Mastitis and Brucellosis. Lakukan pemeriksaan veteriner rutin.",
    image: "https://picsum.photos/seed/dairy-cow/400/250"
  },
  {
    id: "ayam-kampung",
    name: "Ayam Kampung Unggul",
    category: "Unggas",
    breeding: "Sistem semi-intensif (umbaran terbatas). Lebih tahan stres dibanding broiler.",
    feeding: "Campuran bekatul, nasi sisa kering, and sayur-sayuran.",
    operational: "Masa panen lebih lama (70-80 hari) namun harga jual lebih mahal.",
    diseaseControl: "Vaksinasi ND-AI tetap diperlukan meskipun daya tahan lebih kuat.",
    image: "https://picsum.photos/seed/native-chicken/400/250"
  }
];
