package com.marynails.demo;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.DayOfWeek;
import java.time.LocalDate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** Las fechas de la demostracion nunca caen en domingo y no se repiten. */
class DemoServiceTest {

    @Test
    @DisplayName("Los dias habiles saltan los domingos hacia adelante y hacia atras")
    void diasHabiles() {
        LocalDate sabado = LocalDate.of(2026, 12, 5);
        assertThat(DemoService.habil(sabado, 1)).isEqualTo(LocalDate.of(2026, 12, 7));   // lunes
        assertThat(DemoService.habil(sabado, -6)).isEqualTo(LocalDate.of(2026, 11, 28));  // sabado anterior
        assertThat(DemoService.habil(LocalDate.of(2026, 12, 6), 0).getDayOfWeek()).isEqualTo(DayOfWeek.MONDAY);
        for (int n = -60; n <= 10; n++) {
            assertThat(DemoService.habil(LocalDate.of(2026, 12, 3), n).getDayOfWeek()).isNotEqualTo(DayOfWeek.SUNDAY);
        }
    }
}
