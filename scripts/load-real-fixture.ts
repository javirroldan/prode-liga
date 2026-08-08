const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TOURNAMENT_ID = 'c683c1f5-8847-407e-99f1-0a6ef90fe1e4';

// Real fixture Clausura 2026 from TyC Sports
const fixture = [
  // FECHA 1
  // Jueves 23 julio
  { matchday: 1, home: 'Belgrano', away: 'Rosario Central', date: '2026-07-23', time: '19:30', zone: 'Zona B' },
  { matchday: 1, home: 'Sarmiento', away: 'Argentinos Juniors', date: '2026-07-23', time: '19:30', zone: 'Zona B' },
  { matchday: 1, home: 'Defensa y Justicia', away: 'Aldosivi', date: '2026-07-23', time: '21:45', zone: 'Interzonal' },
  // Viernes 24 julio
  { matchday: 1, home: 'Gimnasia y Esgrima Mendoza', away: 'Central Cordoba', date: '2026-07-24', time: '16:45', zone: 'Zona A' },
  { matchday: 1, home: 'Racing Club', away: 'Gimnasia y Esgrima LP', date: '2026-07-24', time: '19:00', zone: 'Zona B' },
  { matchday: 1, home: 'Vélez Sarsfield', away: 'Instituto', date: '2026-07-24', time: '19:00', zone: 'Zona A' },
  { matchday: 1, home: 'Huracán', away: 'Banfield', date: '2026-07-24', time: '19:00', zone: 'Zona B' },
  { matchday: 1, home: 'Platense', away: 'Unión', date: '2026-07-24', time: '19:00', zone: 'Zona A' },
  // Sábado 25 julio
  { matchday: 1, home: 'Estudiantes de Río Cuarto', away: 'Tigre', date: '2026-07-25', time: '14:45', zone: 'Zona B' },
  { matchday: 1, home: 'Newell\'s Old Boys', away: 'Talleres', date: '2026-07-25', time: '17:00', zone: 'Zona A' },
  { matchday: 1, home: 'River Plate', away: 'Barracas Central', date: '2026-07-25', time: '19:15', zone: 'Zona B' },
  { matchday: 1, home: 'Lanús', away: 'San Lorenzo', date: '2026-07-25', time: '21:30', zone: 'Zona A' },
  // Domingo 26 julio
  { matchday: 1, home: 'Atlético Tucumán', away: 'Independiente Rivadavia', date: '2026-07-26', time: '15:00', zone: 'Zona B' },
  { matchday: 1, home: 'Estudiantes LP', away: 'Independiente', date: '2026-07-26', time: '17:15', zone: 'Zona A' },
  { matchday: 1, home: 'Deportivo Riestra', away: 'Boca Juniors', date: '2026-07-26', time: '19:30', zone: 'Zona A' },

  // FECHA 2
  // Martes 28 julio
  { matchday: 2, home: 'San Lorenzo', away: 'Gimnasia y Esgrima Mendoza', date: '2026-07-28', time: '19:00', zone: 'Zona A' },
  { matchday: 2, home: 'Banfield', away: 'Sarmiento', date: '2026-07-28', time: '19:00', zone: 'Zona B' },
  { matchday: 2, home: 'Argentinos Juniors', away: 'Estudiantes de Río Cuarto', date: '2026-07-28', time: '21:15', zone: 'Zona B' },
  { matchday: 2, home: 'Rosario Central', away: 'Racing Club', date: '2026-07-28', time: '21:15', zone: 'Zona B' },
  // Miércoles 29 julio
  { matchday: 2, home: 'Barracas Central', away: 'Aldosivi', date: '2026-07-29', time: '14:30', zone: 'Zona B' },
  { matchday: 2, home: 'Defensa y Justicia', away: 'Deportivo Riestra', date: '2026-07-29', time: '17:00', zone: 'Zona A' },
  { matchday: 2, home: 'Gimnasia y Esgrima LP', away: 'River Plate', date: '2026-07-29', time: '19:15', zone: 'Zona B' },
  { matchday: 2, home: 'Instituto', away: 'Platense', date: '2026-07-29', time: '21:30', zone: 'Zona A' },
  // Jueves 30 julio
  { matchday: 2, home: 'Independiente Rivadavia', away: 'Huracán', date: '2026-07-30', time: '19:00', zone: 'Zona B' },
  { matchday: 2, home: 'Talleres', away: 'Vélez Sarsfield', date: '2026-07-30', time: '19:00', zone: 'Zona A' },
  { matchday: 2, home: 'Independiente', away: 'Newell\'s Old Boys', date: '2026-07-30', time: '21:15', zone: 'Zona A' },
  { matchday: 2, home: 'Central Cordoba', away: 'Atlético Tucumán', date: '2026-07-30', time: '21:15', zone: 'Interzonal' },
  // Postponed (CONMEBOL)
  { matchday: 2, home: 'Boca Juniors', away: 'Estudiantes LP', date: '2026-08-05', time: '19:00', zone: 'Zona A' },
  { matchday: 2, home: 'Tigre', away: 'Belgrano', date: '2026-08-05', time: '21:15', zone: 'Zona B' },
  { matchday: 2, home: 'Unión', away: 'Lanús', date: '2026-08-06', time: '19:00', zone: 'Zona A' },

  // FECHA 3
  // Sábado 1 agosto
  { matchday: 3, home: 'Gimnasia y Esgrima Mendoza', away: 'Unión', date: '2026-08-01', time: '15:30', zone: 'Zona A' },
  { matchday: 3, home: 'Estudiantes de Río Cuarto', away: 'Banfield', date: '2026-08-01', time: '15:30', zone: 'Zona B' },
  { matchday: 3, home: 'Belgrano', away: 'Argentinos Juniors', date: '2026-08-01', time: '18:00', zone: 'Zona B' },
  { matchday: 3, home: 'Estudiantes LP', away: 'Defensa y Justicia', date: '2026-08-01', time: '18:00', zone: 'Zona A' },
  { matchday: 3, home: 'Racing Club', away: 'Tigre', date: '2026-08-01', time: '20:30', zone: 'Zona B' },
  // Domingo 2 agosto
  { matchday: 3, home: 'Deportivo Riestra', away: 'Barracas Central', date: '2026-08-02', time: '14:30', zone: 'Interzonal' },
  { matchday: 3, home: 'Aldosivi', away: 'Gimnasia y Esgrima LP', date: '2026-08-02', time: '14:30', zone: 'Zona B' },
  { matchday: 3, home: 'Newell\'s Old Boys', away: 'Boca Juniors', date: '2026-08-02', time: '17:00', zone: 'Zona A' },
  { matchday: 3, home: 'River Plate', away: 'Rosario Central', date: '2026-08-02', time: '19:15', zone: 'Zona B' },
  { matchday: 3, home: 'Lanús', away: 'Instituto', date: '2026-08-02', time: '21:30', zone: 'Zona A' },
  // Lunes 3 agosto
  { matchday: 3, home: 'Sarmiento', away: 'Independiente Rivadavia', date: '2026-08-03', time: '16:45', zone: 'Zona B' },
  { matchday: 3, home: 'Platense', away: 'Talleres', date: '2026-08-03', time: '19:00', zone: 'Zona A' },
  { matchday: 3, home: 'Vélez Sarsfield', away: 'Independiente', date: '2026-08-03', time: '19:00', zone: 'Zona A' },
  { matchday: 3, home: 'Central Cordoba', away: 'San Lorenzo', date: '2026-08-03', time: '21:15', zone: 'Zona A' },
  { matchday: 3, home: 'Huracán', away: 'Atlético Tucumán', date: '2026-08-03', time: '21:15', zone: 'Zona B' },

  // FECHA 4 (confirmada por AFA 02/08/2026)
  { matchday: 4, home: 'Rosario Central', away: 'Aldosivi', date: '2026-08-07', time: '19:30', zone: 'Zona B' },
  { matchday: 4, home: 'Independiente Rivadavia', away: 'Estudiantes de Río Cuarto', date: '2026-08-07', time: '21:45', zone: 'Zona B' },
  { matchday: 4, home: 'Deportivo Riestra', away: 'Estudiantes LP', date: '2026-08-08', time: '14:45', zone: 'Zona A' },
  { matchday: 4, home: 'Atlético Tucumán', away: 'Sarmiento', date: '2026-08-08', time: '14:45', zone: 'Zona B' },
  { matchday: 4, home: 'Tigre', away: 'River Plate', date: '2026-08-08', time: '17:00', zone: 'Zona B' },
  { matchday: 4, home: 'Boca Juniors', away: 'Vélez Sarsfield', date: '2026-08-08', time: '19:15', zone: 'Zona A' },
  { matchday: 4, home: 'Independiente', away: 'Platense', date: '2026-08-08', time: '21:30', zone: 'Zona A' },
  { matchday: 4, home: 'Instituto', away: 'Gimnasia y Esgrima Mendoza', date: '2026-08-08', time: '21:30', zone: 'Zona A' },
  { matchday: 4, home: 'San Lorenzo', away: 'Huracán', date: '2026-08-09', time: '15:00', zone: 'Interzonal' },
  { matchday: 4, home: 'Defensa y Justicia', away: 'Newell\'s Old Boys', date: '2026-08-09', time: '17:45', zone: 'Zona A' },
  { matchday: 4, home: 'Gimnasia y Esgrima LP', away: 'Barracas Central', date: '2026-08-09', time: '17:45', zone: 'Zona B' },
  { matchday: 4, home: 'Argentinos Juniors', away: 'Racing Club', date: '2026-08-09', time: '20:15', zone: 'Zona B' },
  { matchday: 4, home: 'Banfield', away: 'Belgrano', date: '2026-08-10', time: '19:00', zone: 'Zona B' },
  { matchday: 4, home: 'Unión', away: 'Central Cordoba', date: '2026-08-10', time: '21:15', zone: 'Zona A' },
  { matchday: 4, home: 'Talleres', away: 'Lanús', date: '2026-08-11', time: '21:00', zone: 'Zona A' },

  // FECHA 5 (confirmada por AFA 02/08/2026)
  { matchday: 5, home: 'Racing Club', away: 'Banfield', date: '2026-08-14', time: '20:30', zone: 'Zona B' },
  { matchday: 5, home: 'Aldosivi', away: 'Tigre', date: '2026-08-15', time: '14:30', zone: 'Zona B' },
  { matchday: 5, home: 'San Lorenzo', away: 'Unión', date: '2026-08-15', time: '14:30', zone: 'Zona A' },
  { matchday: 5, home: 'Estudiantes LP', away: 'Gimnasia y Esgrima LP', date: '2026-08-15', time: '16:45', zone: 'Interzonal' },
  { matchday: 5, home: 'Newell\'s Old Boys', away: 'Deportivo Riestra', date: '2026-08-15', time: '19:00', zone: 'Zona A' },
  { matchday: 5, home: 'Belgrano', away: 'Independiente Rivadavia', date: '2026-08-15', time: '19:00', zone: 'Zona B' },
  { matchday: 5, home: 'Platense', away: 'Boca Juniors', date: '2026-08-15', time: '21:15', zone: 'Zona A' },
  { matchday: 5, home: 'Central Cordoba', away: 'Instituto', date: '2026-08-16', time: '15:00', zone: 'Zona A' },
  { matchday: 5, home: 'Sarmiento', away: 'Huracán', date: '2026-08-16', time: '15:00', zone: 'Zona B' },
  { matchday: 5, home: 'River Plate', away: 'Argentinos Juniors', date: '2026-08-16', time: '18:00', zone: 'Zona B' },
  { matchday: 5, home: 'Barracas Central', away: 'Rosario Central', date: '2026-08-16', time: '20:15', zone: 'Zona B' },
  { matchday: 5, home: 'Estudiantes de Río Cuarto', away: 'Atlético Tucumán', date: '2026-08-17', time: '14:45', zone: 'Zona B' },
  { matchday: 5, home: 'Lanús', away: 'Independiente', date: '2026-08-17', time: '17:00', zone: 'Zona A' },
  { matchday: 5, home: 'Vélez Sarsfield', away: 'Defensa y Justicia', date: '2026-08-17', time: '19:15', zone: 'Zona A' },
  { matchday: 5, home: 'Gimnasia y Esgrima Mendoza', away: 'Talleres', date: '2026-08-17', time: '21:30', zone: 'Zona A' },

  // FECHA 6 (Interzonal, confirmada por AFA 02/08/2026)
  { matchday: 6, home: 'Aldosivi', away: 'Unión', date: '2026-08-21', time: '14:30', zone: 'Interzonal' },
  { matchday: 6, home: 'Estudiantes de Río Cuarto', away: 'San Lorenzo', date: '2026-08-21', time: '20:00', zone: 'Interzonal' },
  { matchday: 6, home: 'Gimnasia y Esgrima LP', away: 'Gimnasia y Esgrima Mendoza', date: '2026-08-22', time: '16:00', zone: 'Zona B' },
  { matchday: 6, home: 'Atlético Tucumán', away: 'Instituto', date: '2026-08-22', time: '16:00', zone: 'Zona B' },
  { matchday: 6, home: 'Independiente', away: 'Independiente Rivadavia', date: '2026-08-22', time: '18:30', zone: 'Zona A' },
  { matchday: 6, home: 'Newell\'s Old Boys', away: 'Banfield', date: '2026-08-22', time: '21:00', zone: 'Interzonal' },
  { matchday: 6, home: 'Huracán', away: 'Deportivo Riestra', date: '2026-08-22', time: '21:00', zone: 'Zona B' },
  { matchday: 6, home: 'Sarmiento', away: 'Estudiantes LP', date: '2026-08-23', time: '14:45', zone: 'Interzonal' },
  { matchday: 6, home: 'Barracas Central', away: 'Platense', date: '2026-08-23', time: '14:45', zone: 'Zona B' },
  { matchday: 6, home: 'Belgrano', away: 'Defensa y Justicia', date: '2026-08-23', time: '17:00', zone: 'Interzonal' },
  { matchday: 6, home: 'River Plate', away: 'Vélez Sarsfield', date: '2026-08-23', time: '19:15', zone: 'Zona B' },
  { matchday: 6, home: 'Racing Club', away: 'Boca Juniors', date: '2026-08-23', time: '21:30', zone: 'Zona B' },
  { matchday: 6, home: 'Tigre', away: 'Central Cordoba', date: '2026-08-24', time: '19:00', zone: 'Zona B' },
  { matchday: 6, home: 'Lanús', away: 'Argentinos Juniors', date: '2026-08-24', time: '21:15', zone: 'Interzonal' },
  { matchday: 6, home: 'Talleres', away: 'Rosario Central', date: '2026-08-24', time: '21:15', zone: 'Zona A' },

  // FECHA 7 (confirmada por AFA 02/08/2026)
  { matchday: 7, home: 'Huracán', away: 'Estudiantes de Río Cuarto', date: '2026-08-28', time: '19:00', zone: 'Zona B' },
  { matchday: 7, home: 'Unión', away: 'Sarmiento', date: '2026-08-28', time: '21:15', zone: 'Interzonal' },
  { matchday: 7, home: 'Deportivo Riestra', away: 'Vélez Sarsfield', date: '2026-08-29', time: '14:45', zone: 'Zona A' },
  { matchday: 7, home: 'Rosario Central', away: 'Gimnasia y Esgrima LP', date: '2026-08-29', time: '17:00', zone: 'Zona B' },
  { matchday: 7, home: 'Boca Juniors', away: 'Lanús', date: '2026-08-29', time: '19:00', zone: 'Zona A' },
  { matchday: 7, home: 'Talleres', away: 'Central Cordoba', date: '2026-08-29', time: '21:30', zone: 'Zona A' },
  { matchday: 7, home: 'Atlético Tucumán', away: 'Belgrano', date: '2026-08-29', time: '21:30', zone: 'Zona B' },
  { matchday: 7, home: 'Banfield', away: 'River Plate', date: '2026-08-30', time: '15:00', zone: 'Zona B' },
  { matchday: 7, home: 'Argentinos Juniors', away: 'Aldosivi', date: '2026-08-30', time: '17:00', zone: 'Zona B' },
  { matchday: 7, home: 'Independiente', away: 'Gimnasia y Esgrima Mendoza', date: '2026-08-30', time: '19:15', zone: 'Zona A' },
  { matchday: 7, home: 'Independiente Rivadavia', away: 'Racing Club', date: '2026-08-30', time: '21:30', zone: 'Zona B' },
  { matchday: 7, home: 'Defensa y Justicia', away: 'Platense', date: '2026-08-31', time: '19:00', zone: 'Zona A' },
  { matchday: 7, home: 'Estudiantes LP', away: 'Newell\'s Old Boys', date: '2026-08-31', time: '19:00', zone: 'Zona A' },
  { matchday: 7, home: 'Tigre', away: 'Barracas Central', date: '2026-08-31', time: '21:15', zone: 'Zona B' },
  { matchday: 7, home: 'Instituto', away: 'San Lorenzo', date: '2026-08-31', time: '21:15', zone: 'Zona A' },

  // FECHA 8
  { matchday: 8, home: 'Gimnasia y Esgrima Mendoza', away: 'Boca Juniors', date: '2026-09-05', time: '15:00', zone: 'Zona A' },
  { matchday: 8, home: 'Central Cordoba', away: 'Independiente', date: '2026-09-05', time: '17:15', zone: 'Zona A' },
  { matchday: 8, home: 'San Lorenzo', away: 'Talleres', date: '2026-09-05', time: '19:30', zone: 'Zona A' },
  { matchday: 8, home: 'Rosario Central', away: 'Newell\'s Old Boys', date: '2026-09-05', time: '21:45', zone: 'Zona B' },
  { matchday: 8, home: 'Barracas Central', away: 'Argentinos Juniors', date: '2026-09-06', time: '15:00', zone: 'Zona B' },
  { matchday: 8, home: 'Unión', away: 'Instituto', date: '2026-09-06', time: '15:00', zone: 'Zona A' },
  { matchday: 8, home: 'Lanús', away: 'Defensa y Justicia', date: '2026-09-06', time: '17:15', zone: 'Zona A' },
  { matchday: 8, home: 'Gimnasia y Esgrima LP', away: 'Tigre', date: '2026-09-06', time: '19:30', zone: 'Zona B' },
  { matchday: 8, home: 'Aldosivi', away: 'Banfield', date: '2026-09-06', time: '21:45', zone: 'Zona B' },
  { matchday: 8, home: 'Platense', away: 'Deportivo Riestra', date: '2026-09-07', time: '15:00', zone: 'Zona A' },
  { matchday: 8, home: 'Vélez Sarsfield', away: 'Estudiantes LP', date: '2026-09-07', time: '17:15', zone: 'Zona A' },
  { matchday: 8, home: 'River Plate', away: 'Independiente Rivadavia', date: '2026-09-07', time: '19:30', zone: 'Zona B' },
  { matchday: 8, home: 'Belgrano', away: 'Huracán', date: '2026-09-07', time: '21:45', zone: 'Zona B' },
  { matchday: 8, home: 'Estudiantes de Río Cuarto', away: 'Sarmiento', date: '2026-09-08', time: '19:00', zone: 'Zona B' },
  { matchday: 8, home: 'Racing Club', away: 'Atlético Tucumán', date: '2026-09-08', time: '21:15', zone: 'Zona B' },

  // FECHA 9
  { matchday: 9, home: 'Banfield', away: 'Barracas Central', date: '2026-09-12', time: '15:00', zone: 'Zona B' },
  { matchday: 9, home: 'Deportivo Riestra', away: 'Lanús', date: '2026-09-12', time: '17:15', zone: 'Zona A' },
  { matchday: 9, home: 'Boca Juniors', away: 'Central Cordoba', date: '2026-09-12', time: '19:30', zone: 'Zona A' },
  { matchday: 9, home: 'Independiente', away: 'San Lorenzo', date: '2026-09-12', time: '21:45', zone: 'Zona A' },
  { matchday: 9, home: 'Talleres', away: 'Unión', date: '2026-09-13', time: '15:00', zone: 'Zona A' },
  { matchday: 9, home: 'Estudiantes LP', away: 'Platense', date: '2026-09-13', time: '15:00', zone: 'Zona A' },
  { matchday: 9, home: 'Independiente Rivadavia', away: 'Aldosivi', date: '2026-09-13', time: '17:15', zone: 'Zona B' },
  { matchday: 9, home: 'Tigre', away: 'Rosario Central', date: '2026-09-13', time: '19:30', zone: 'Zona B' },
  { matchday: 9, home: 'Huracán', away: 'Racing Club', date: '2026-09-13', time: '21:45', zone: 'Zona B' },
  { matchday: 9, home: 'Argentinos Juniors', away: 'Gimnasia y Esgrima LP', date: '2026-09-14', time: '15:00', zone: 'Zona B' },
  { matchday: 9, home: 'Sarmiento', away: 'Belgrano', date: '2026-09-14', time: '17:15', zone: 'Zona B' },
  { matchday: 9, home: 'Atlético Tucumán', away: 'River Plate', date: '2026-09-14', time: '19:30', zone: 'Zona B' },
  { matchday: 9, home: 'Defensa y Justicia', away: 'Gimnasia y Esgrima Mendoza', date: '2026-09-14', time: '21:45', zone: 'Zona A' },
  { matchday: 9, home: 'Newell\'s Old Boys', away: 'Vélez Sarsfield', date: '2026-09-15', time: '19:00', zone: 'Zona A' },
  { matchday: 9, home: 'Instituto', away: 'Estudiantes de Río Cuarto', date: '2026-09-15', time: '21:15', zone: 'Zona A' },

  // FECHA 10
  { matchday: 10, home: 'Vélez Sarsfield', away: 'Tigre', date: '2026-09-19', time: '15:00', zone: 'Zona A' },
  { matchday: 10, home: 'Unión', away: 'Independiente', date: '2026-09-19', time: '17:15', zone: 'Zona A' },
  { matchday: 10, home: 'Platense', away: 'Newell\'s Old Boys', date: '2026-09-19', time: '19:30', zone: 'Zona A' },
  { matchday: 10, home: 'Racing Club', away: 'Sarmiento', date: '2026-09-19', time: '21:45', zone: 'Zona B' },
  { matchday: 10, home: 'Gimnasia y Esgrima LP', away: 'Banfield', date: '2026-09-20', time: '15:00', zone: 'Zona B' },
  { matchday: 10, home: 'Rosario Central', away: 'Argentinos Juniors', date: '2026-09-20', time: '15:00', zone: 'Zona B' },
  { matchday: 10, home: 'San Lorenzo', away: 'Boca Juniors', date: '2026-09-20', time: '17:15', zone: 'Zona A' },
  { matchday: 10, home: 'Barracas Central', away: 'Independiente Rivadavia', date: '2026-09-20', time: '19:30', zone: 'Zona B' },
  { matchday: 10, home: 'Aldosivi', away: 'Atlético Tucumán', date: '2026-09-20', time: '21:45', zone: 'Zona B' },
  { matchday: 10, home: 'Gimnasia y Esgrima Mendoza', away: 'Deportivo Riestra', date: '2026-09-21', time: '15:00', zone: 'Zona A' },
  { matchday: 10, home: 'Central Cordoba', away: 'Defensa y Justicia', date: '2026-09-21', time: '17:15', zone: 'Zona A' },
  { matchday: 10, home: 'Instituto', away: 'Talleres', date: '2026-09-21', time: '19:30', zone: 'Zona A' },
  { matchday: 10, home: 'Belgrano', away: 'Estudiantes de Río Cuarto', date: '2026-09-21', time: '21:45', zone: 'Zona B' },
  { matchday: 10, home: 'River Plate', away: 'Huracán', date: '2026-09-22', time: '19:00', zone: 'Zona B' },
  { matchday: 10, home: 'Lanús', away: 'Estudiantes LP', date: '2026-09-22', time: '21:15', zone: 'Zona A' },

  // FECHA 11
  { matchday: 11, home: 'Vélez Sarsfield', away: 'Platense', date: '2026-09-26', time: '15:00', zone: 'Zona A' },
  { matchday: 11, home: 'Banfield', away: 'Rosario Central', date: '2026-09-26', time: '17:15', zone: 'Zona B' },
  { matchday: 11, home: 'Independiente Rivadavia', away: 'Gimnasia y Esgrima LP', date: '2026-09-26', time: '19:30', zone: 'Zona B' },
  { matchday: 11, home: 'Talleres', away: 'Belgrano', date: '2026-09-26', time: '21:45', zone: 'Zona A' },
  { matchday: 11, home: 'Sarmiento', away: 'River Plate', date: '2026-09-27', time: '15:00', zone: 'Zona B' },
  { matchday: 11, home: 'Boca Juniors', away: 'Unión', date: '2026-09-27', time: '17:15', zone: 'Zona A' },
  { matchday: 11, home: 'Argentinos Juniors', away: 'Tigre', date: '2026-09-27', time: '19:30', zone: 'Zona B' },
  { matchday: 11, home: 'Atlético Tucumán', away: 'Barracas Central', date: '2026-09-27', time: '21:45', zone: 'Zona B' },
  { matchday: 11, home: 'Huracán', away: 'Aldosivi', date: '2026-09-28', time: '15:00', zone: 'Zona B' },
  { matchday: 11, home: 'Defensa y Justicia', away: 'San Lorenzo', date: '2026-09-28', time: '17:15', zone: 'Zona A' },
  { matchday: 11, home: 'Estudiantes de Río Cuarto', away: 'Racing Club', date: '2026-09-28', time: '19:30', zone: 'Zona B' },
  { matchday: 11, home: 'Independiente', away: 'Instituto', date: '2026-09-28', time: '21:45', zone: 'Zona A' },
  { matchday: 11, home: 'Newell\'s Old Boys', away: 'Lanús', date: '2026-09-29', time: '19:00', zone: 'Zona A' },
  { matchday: 11, home: 'Deportivo Riestra', away: 'Central Cordoba', date: '2026-09-29', time: '19:00', zone: 'Zona A' },
  { matchday: 11, home: 'Estudiantes LP', away: 'Gimnasia y Esgrima Mendoza', date: '2026-09-29', time: '21:15', zone: 'Zona A' },

  // FECHA 12
  { matchday: 12, home: 'Tigre', away: 'Banfield', date: '2026-10-03', time: '15:00', zone: 'Zona B' },
  { matchday: 12, home: 'Gimnasia y Esgrima LP', away: 'Atlético Tucumán', date: '2026-10-03', time: '17:15', zone: 'Zona B' },
  { matchday: 12, home: 'Lanús', away: 'Vélez Sarsfield', date: '2026-10-03', time: '19:30', zone: 'Zona A' },
  { matchday: 12, home: 'Gimnasia y Esgrima Mendoza', away: 'Newell\'s Old Boys', date: '2026-10-03', time: '21:45', zone: 'Zona A' },
  { matchday: 12, home: 'Unión', away: 'Defensa y Justicia', date: '2026-10-04', time: '15:00', zone: 'Zona A' },
  { matchday: 12, home: 'Talleres', away: 'Independiente', date: '2026-10-04', time: '17:15', zone: 'Zona A' },
  { matchday: 12, home: 'Racing Club', away: 'Belgrano', date: '2026-10-04', time: '19:30', zone: 'Zona B' },
  { matchday: 12, home: 'Aldosivi', away: 'Sarmiento', date: '2026-10-04', time: '21:45', zone: 'Zona B' },
  { matchday: 12, home: 'River Plate', away: 'Estudiantes de Río Cuarto', date: '2026-10-05', time: '17:15', zone: 'Zona B' },
  { matchday: 12, home: 'Instituto', away: 'Boca Juniors', date: '2026-10-05', time: '19:30', zone: 'Zona A' },
  { matchday: 12, home: 'Rosario Central', away: 'Independiente Rivadavia', date: '2026-10-05', time: '21:45', zone: 'Zona B' },
  { matchday: 12, home: 'Platense', away: 'Argentinos Juniors', date: '2026-10-06', time: '19:00', zone: 'Zona A' },
  { matchday: 12, home: 'Central Cordoba', away: 'Estudiantes LP', date: '2026-10-06', time: '19:00', zone: 'Zona A' },
  { matchday: 12, home: 'Barracas Central', away: 'Huracán', date: '2026-10-06', time: '21:15', zone: 'Zona B' },
  { matchday: 12, home: 'San Lorenzo', away: 'Deportivo Riestra', date: '2026-10-06', time: '21:15', zone: 'Zona A' },

  // FECHA 13
  { matchday: 13, home: 'Platense', away: 'Lanús', date: '2026-10-17', time: '15:00', zone: 'Zona A' },
  { matchday: 13, home: 'Sarmiento', away: 'Barracas Central', date: '2026-10-17', time: '17:15', zone: 'Zona B' },
  { matchday: 13, home: 'Independiente Rivadavia', away: 'Tigre', date: '2026-10-17', time: '19:30', zone: 'Zona B' },
  { matchday: 13, home: 'Boca Juniors', away: 'Talleres', date: '2026-10-17', time: '21:45', zone: 'Zona A' },
  { matchday: 13, home: 'Vélez Sarsfield', away: 'Gimnasia y Esgrima Mendoza', date: '2026-10-18', time: '15:00', zone: 'Zona A' },
  { matchday: 13, home: 'Deportivo Riestra', away: 'Unión', date: '2026-10-18', time: '15:00', zone: 'Zona A' },
  { matchday: 13, home: 'Estudiantes LP', away: 'San Lorenzo', date: '2026-10-18', time: '17:15', zone: 'Zona A' },
  { matchday: 13, home: 'Estudiantes de Río Cuarto', away: 'Aldosivi', date: '2026-10-18', time: '19:30', zone: 'Zona B' },
  { matchday: 13, home: 'Racing Club', away: 'Independiente', date: '2026-10-18', time: '21:45', zone: 'Zona B' },
  { matchday: 13, home: 'Atlético Tucumán', away: 'Rosario Central', date: '2026-10-19', time: '15:00', zone: 'Zona B' },
  { matchday: 13, home: 'Huracán', away: 'Gimnasia y Esgrima LP', date: '2026-10-19', time: '17:15', zone: 'Zona B' },
  { matchday: 13, home: 'Belgrano', away: 'River Plate', date: '2026-10-19', time: '19:30', zone: 'Zona B' },
  { matchday: 13, home: 'Newell\'s Old Boys', away: 'Central Cordoba', date: '2026-10-19', time: '21:45', zone: 'Zona A' },
  { matchday: 13, home: 'Banfield', away: 'Argentinos Juniors', date: '2026-10-20', time: '19:00', zone: 'Zona B' },
  { matchday: 13, home: 'Defensa y Justicia', away: 'Instituto', date: '2026-10-20', time: '21:15', zone: 'Zona A' },

  // FECHA 14
  { matchday: 14, home: 'Aldosivi', away: 'Belgrano', date: '2026-10-24', time: '15:00', zone: 'Zona B' },
  { matchday: 14, home: 'Instituto', away: 'Deportivo Riestra', date: '2026-10-24', time: '17:15', zone: 'Zona A' },
  { matchday: 14, home: 'Argentinos Juniors', away: 'Independiente Rivadavia', date: '2026-10-24', time: '19:30', zone: 'Zona B' },
  { matchday: 14, home: 'Unión', away: 'Estudiantes LP', date: '2026-10-24', time: '21:45', zone: 'Zona A' },
  { matchday: 14, home: 'Independiente', away: 'Boca Juniors', date: '2026-10-25', time: '17:15', zone: 'Zona A' },
  { matchday: 14, home: 'Barracas Central', away: 'Estudiantes de Río Cuarto', date: '2026-10-25', time: '15:00', zone: 'Zona B' },
  { matchday: 14, home: 'San Lorenzo', away: 'Newell\'s Old Boys', date: '2026-10-25', time: '19:30', zone: 'Zona A' },
  { matchday: 14, home: 'Gimnasia y Esgrima Mendoza', away: 'Platense', date: '2026-10-25', time: '21:45', zone: 'Zona A' },
  { matchday: 14, home: 'Tigre', away: 'Atlético Tucumán', date: '2026-10-26', time: '15:00', zone: 'Zona B' },
  { matchday: 14, home: 'Rosario Central', away: 'Huracán', date: '2026-10-26', time: '17:15', zone: 'Zona B' },
  { matchday: 14, home: 'River Plate', away: 'Racing Club', date: '2026-10-26', time: '19:30', zone: 'Zona B' },
  { matchday: 14, home: 'Gimnasia y Esgrima LP', away: 'Sarmiento', date: '2026-10-26', time: '21:45', zone: 'Zona B' },
  { matchday: 14, home: 'Talleres', away: 'Defensa y Justicia', date: '2026-10-27', time: '19:00', zone: 'Zona A' },
  { matchday: 14, home: 'Banfield', away: 'Lanús', date: '2026-10-27', time: '19:00', zone: 'Zona B' },
  { matchday: 14, home: 'Central Cordoba', away: 'Vélez Sarsfield', date: '2026-10-27', time: '21:15', zone: 'Zona A' },

  // FECHA 15 (Superclásico Boca-River)
  { matchday: 15, home: 'Newell\'s Old Boys', away: 'Unión', date: '2026-10-31', time: '15:00', zone: 'Zona A' },
  { matchday: 15, home: 'Estudiantes de Río Cuarto', away: 'Gimnasia y Esgrima LP', date: '2026-10-31', time: '17:15', zone: 'Zona B' },
  { matchday: 15, home: 'Estudiantes LP', away: 'Instituto', date: '2026-10-31', time: '19:30', zone: 'Zona A' },
  { matchday: 15, home: 'Defensa y Justicia', away: 'Independiente', date: '2026-10-31', time: '21:45', zone: 'Zona A' },
  { matchday: 15, home: 'Atlético Tucumán', away: 'Argentinos Juniors', date: '2026-11-01', time: '15:00', zone: 'Zona B' },
  { matchday: 15, home: 'Racing Club', away: 'Aldosivi', date: '2026-11-01', time: '17:15', zone: 'Zona B' },
  { matchday: 15, home: 'Boca Juniors', away: 'River Plate', date: '2026-11-01', time: '19:30', zone: 'Interzonal' },
  { matchday: 15, home: 'Sarmiento', away: 'Rosario Central', date: '2026-11-01', time: '21:45', zone: 'Zona B' },
  { matchday: 15, home: 'Deportivo Riestra', away: 'Talleres', date: '2026-11-02', time: '15:00', zone: 'Zona A' },
  { matchday: 15, home: 'Belgrano', away: 'Barracas Central', date: '2026-11-02', time: '17:15', zone: 'Zona B' },
  { matchday: 15, home: 'Platense', away: 'Central Cordoba', date: '2026-11-02', time: '19:30', zone: 'Zona A' },
  { matchday: 15, home: 'Independiente Rivadavia', away: 'Banfield', date: '2026-11-02', time: '21:45', zone: 'Zona B' },
  { matchday: 15, home: 'Vélez Sarsfield', away: 'San Lorenzo', date: '2026-11-03', time: '19:00', zone: 'Zona A' },
  { matchday: 15, home: 'Lanús', away: 'Gimnasia y Esgrima Mendoza', date: '2026-11-03', time: '19:00', zone: 'Zona A' },
  { matchday: 15, home: 'Huracán', away: 'Tigre', date: '2026-11-03', time: '21:15', zone: 'Zona B' },

  // FECHA 16
  { matchday: 16, home: 'Boca Juniors', away: 'Defensa y Justicia', date: '2026-11-07', time: '17:15', zone: 'Zona A' },
  { matchday: 16, home: 'Independiente', away: 'Deportivo Riestra', date: '2026-11-07', time: '19:30', zone: 'Zona A' },
  { matchday: 16, home: 'Rosario Central', away: 'Estudiantes de Río Cuarto', date: '2026-11-07', time: '21:45', zone: 'Zona B' },
  { matchday: 16, home: 'Central Cordoba', away: 'Lanús', date: '2026-11-08', time: '15:00', zone: 'Zona A' },
  { matchday: 16, home: 'Barracas Central', away: 'Racing Club', date: '2026-11-08', time: '17:15', zone: 'Zona B' },
  { matchday: 16, home: 'San Lorenzo', away: 'Platense', date: '2026-11-08', time: '19:30', zone: 'Zona A' },
  { matchday: 16, home: 'Talleres', away: 'Estudiantes LP', date: '2026-11-08', time: '21:45', zone: 'Zona A' },
  { matchday: 16, home: 'Tigre', away: 'Sarmiento', date: '2026-11-09', time: '15:00', zone: 'Zona B' },
  { matchday: 16, home: 'Aldosivi', away: 'River Plate', date: '2026-11-09', time: '17:15', zone: 'Zona B' },
  { matchday: 16, home: 'Gimnasia y Esgrima Mendoza', away: 'Independiente Rivadavia', date: '2026-11-09', time: '19:30', zone: 'Zona A' },
  { matchday: 16, home: 'Instituto', away: 'Newell\'s Old Boys', date: '2026-11-09', time: '21:45', zone: 'Zona A' },
  { matchday: 16, home: 'Gimnasia y Esgrima LP', away: 'Belgrano', date: '2026-11-10', time: '19:00', zone: 'Zona B' },
  { matchday: 16, home: 'Banfield', away: 'Atlético Tucumán', date: '2026-11-10', time: '19:00', zone: 'Zona B' },
  { matchday: 16, home: 'Unión', away: 'Vélez Sarsfield', date: '2026-11-10', time: '21:15', zone: 'Zona A' },
  { matchday: 16, home: 'Argentinos Juniors', away: 'Huracán', date: '2026-11-10', time: '21:15', zone: 'Zona B' },
];

async function main() {
  // Delete all existing matches
  const deleted = await prisma.prediction.deleteMany();
  console.log('Deleted predictions:', deleted.count);
  const deletedM = await prisma.match.deleteMany();
  console.log('Deleted matches:', deletedM.count);

  // Insert all matches
  const matches = fixture.map(m => ({
    tournamentId: TOURNAMENT_ID,
    matchday: m.matchday,
    homeTeam: m.home,
    awayTeam: m.away,
    date: new Date(m.date + 'T' + m.time + ':00.000Z'),
    time: m.time,
    status: 'SCHEDULED',
  }));

  console.log(`Inserting ${matches.length} matches...`);

  const batchSize = 50;
  for (let i = 0; i < matches.length; i += batchSize) {
    const batch = matches.slice(i, i + batchSize);
    await prisma.match.createMany({ data: batch });
    console.log(`  Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} matches`);
  }

  const count = await prisma.match.count();
  console.log(`Total matches in DB: ${count}`);

  // Show summary per matchday
  for (let md = 1; md <= 16; md++) {
    const mds = await prisma.match.findMany({ where: { matchday: md }, orderBy: { date: 'asc' } });
    const first = mds[0]?.date ? new Date(mds[0].date).toISOString().slice(0, 10) : '?';
    const last = mds[mds.length - 1]?.date ? new Date(mds[mds.length - 1].date).toISOString().slice(0, 10) : '?';
    console.log(`Fecha ${md}: ${mds.length} partidos (${first} a ${last})`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
