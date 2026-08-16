const teamDisplayNames: Record<string, string> = {
  "Gimnasia y Esgrima Mendoza": "Gimnasia (M)",
  "Estudiantes de Río Cuarto": "Estudiantes (RC)",
  "Gimnasia y Esgrima LP": "Gimnasia LP",
  "Independiente Rivadavia": "Independiente (R)",
  "Argentinos Juniors": "Argentinos",
};

export function getTeamDisplayName(teamName: string): string {
  return teamDisplayNames[teamName] ?? teamName;
}
