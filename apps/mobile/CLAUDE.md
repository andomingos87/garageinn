# CLAUDE.md - Mobile App

This file provides guidance specific to the React Native/Expo mobile application.

## Tech Stack

- **Framework**: Expo 54 (managed workflow)
- **React Native**: 0.81.5
- **React**: 19.1
- **TypeScript**: 5.9 (strict mode)
- **Navigation**: React Navigation 7
- **Backend**: Supabase
- **Testing**: Jest + React Native Testing Library
- **Monitoring**: Sentry

## Commands

```bash
npm run start           # Start Expo dev server
npm run android         # Start on Android emulator/device
npm run ios             # Start on iOS simulator/device
npm run lint:fix        # Auto-fix ESLint errors
npm run format          # Format with Prettier
npm run typecheck       # TypeScript check
npm test                # Run Jest tests
npm run test:watch      # Jest in watch mode
npm run test:coverage   # Run tests with coverage report
```

## Directory Structure

```
src/
├── components/
│   ├── guards/             # Permission-based component guards
│   │   └── ProtectedView.tsx
│   └── ui/                 # Reusable UI components
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Loading.tsx
│       └── SignaturePad.tsx
├── lib/
│   ├── observability/      # Logging and Sentry integration
│   │   ├── logger.ts
│   │   ├── sentry.ts
│   │   └── hooks.ts
│   └── supabase/           # Supabase client configuration
│       ├── client.ts
│       └── config.ts
├── modules/                # Feature modules
│   ├── auth/               # Authentication
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── screens/
│   │   ├── services/
│   │   └── types/
│   ├── checklists/         # Checklist execution
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── screens/
│   │   ├── services/
│   │   └── types/
│   ├── tickets/            # Ticket management
│   │   ├── components/
│   │   ├── screens/
│   │   ├── services/
│   │   └── types/
│   ├── home/               # Home screen and unit details
│   ├── profile/            # User profile management
│   ├── notifications/      # Push notifications
│   ├── settings/           # App settings
│   └── user/               # User profile and permissions
├── navigation/             # React Navigation configuration
│   └── types.ts            # Type-safe navigation types
└── theme/                  # Design tokens and theming
```

## Conventions

### Module Structure

Each feature module follows this pattern:
```
modules/[feature]/
├── components/         # Feature-specific components
├── screens/            # Screen components
├── hooks/              # Feature-specific hooks
├── services/           # API/business logic
├── types/              # TypeScript types
├── constants/          # Feature constants (optional)
└── index.ts            # Public exports
```

### Path Aliases

Use path aliases for imports:
```typescript
import { Button } from "@/components/ui";
import { useAuth } from "@/modules/auth";
import { supabase } from "@/lib/supabase";
import { colors } from "@/theme";
```

Available aliases:
- `@/*` → `src/*`
- `@/components/*` → `src/components/*`
- `@/hooks/*` → `src/hooks/*`
- `@/lib/*` → `src/lib/*`
- `@/theme/*` → `src/theme/*`
- `@/types/*` → `src/types/*`

### Navigation

Type-safe navigation using React Navigation:

```typescript
// Define in navigation/types.ts
export type TicketsStackParamList = {
  TicketsList: undefined;
  TicketDetails: { ticketId: string };
  NewTicket: { type?: 'sinistro' | 'manutencao' | 'compras' | 'rh' };
};

// Use in screens
import { TicketsStackScreenProps } from "@/navigation/types";

type Props = TicketsStackScreenProps<"TicketDetails">;

export function TicketDetailsScreen({ route, navigation }: Props) {
  const { ticketId } = route.params;
  // ...
}
```

### Navigation Structure

```
RootStack
├── Login
├── ForgotPassword
├── ResetPassword
├── Main (Tabs)
│   ├── Home (Stack)
│   │   ├── HomeScreen
│   │   └── UnitDetails
│   ├── Checklists (Stack)
│   │   ├── ChecklistsList
│   │   ├── ChecklistExecution
│   │   └── ChecklistDetails
│   ├── Tickets (Stack)
│   │   ├── TicketsList
│   │   ├── TicketDetails
│   │   └── NewTicket
│   └── Profile (Stack)
│       ├── ProfileScreen
│       ├── EditProfile
│       └── ChangePassword
├── Notifications (Modal)
└── Settings (Modal)
```

## Authentication

### Auth Context

```typescript
import { useAuth } from "@/modules/auth";

function MyComponent() {
  const { user, session, signOut, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!user) return <LoginScreen />;

  return <MainApp />;
}
```

### Protected Views

```typescript
import { ProtectedView } from "@/components/guards";

<ProtectedView permission="tickets:create">
  <CreateTicketButton />
</ProtectedView>
```

## Permissions

### Permission Service

```typescript
import { usePermissions } from "@/modules/user";

function MyComponent() {
  const { hasPermission, canAccessTicketType } = usePermissions();

  const canCreate = hasPermission("tickets:create");
  const canViewRH = canAccessTicketType("rh", "read");
}
```

## Testing

### Unit Tests

Tests are co-located with source files in `__tests__/` directories:

```typescript
// src/components/ui/__tests__/Button.test.tsx
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "../Button";

describe("Button", () => {
  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Click</Button>);
    fireEvent.press(getByText("Click"));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Coverage Thresholds

Current baseline (MVP phase):
- Branches: 25%
- Functions: 20%
- Lines: 25%
- Statements: 25%

## Observability

### Logging

```typescript
import { logger } from "@/lib/observability";

logger.info("User logged in", { userId: user.id });
logger.error("Failed to fetch tickets", { error });
logger.debug("Rendering component", { props });
```

### Sentry Integration

Error tracking is configured via `@sentry/react-native`. Errors are automatically captured; manual capture:

```typescript
import * as Sentry from "@sentry/react-native";

Sentry.captureException(error);
Sentry.captureMessage("Something went wrong");
```

## Common Patterns

### Service Pattern

```typescript
// services/ticketsService.ts
import { supabase } from "@/lib/supabase";

export const ticketsService = {
  async getTickets(unitId?: string) {
    const query = supabase.from("tickets").select("*");
    if (unitId) query.eq("unit_id", unitId);
    return query;
  },

  async createTicket(data: CreateTicketInput) {
    return supabase.from("tickets").insert(data).select().single();
  },
};
```

### Async Storage

For local persistence:
```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

// Draft service example
await AsyncStorage.setItem("draft_ticket", JSON.stringify(draft));
const draft = await AsyncStorage.getItem("draft_ticket");
```

### Image Handling

```typescript
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

// Pick and compress image
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  quality: 0.8,
});
```

## Platform-Specific Notes

### iOS

- Requires Xcode for simulator
- Pod installation: `cd ios && pod install`

### Android

- Requires Android Studio for emulator
- Gradle builds can be slow on first run

### Environment Variables

Use `expo-constants` for environment configuration:
```typescript
import Constants from "expo-constants";

const apiUrl = Constants.expoConfig?.extra?.apiUrl;
```
